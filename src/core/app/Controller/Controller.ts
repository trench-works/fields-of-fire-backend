import { WebSocket } from "ws";
import { Instantiable } from "../Types/Instantiable";
import { validateSync, ValidationError } from "class-validator";
import { IGuard, RessourceAccessLevel } from "../Providers/Guard";
import { AccessRefused, SocketError } from "../../errors";
import { UserInfos } from "../Types/UserInfos";
import { WebSocketManager } from "../WebSocket/WebSocketManager";
import {
    InputAction,
    MultipleClientsOutputAction,
    SingleClientOutputAction,
} from "../../types/Action";

type ControllerConfig<RessourceKeyObject extends Record<string, any>> = {
    topic: string;
    key: Instantiable<RessourceKeyObject>;
    guards?: IGuard[];
};

type ControllerOptions<
    RessourceKeyObject extends Record<string, any>,
    OutputActions,
    ReturnActions
> = {
    topic: string;
    key: Instantiable<RessourceKeyObject>;
    guards?: IGuard[];
    socketManager?: WebSocketManager<
        RessourceKeyObject,
        OutputActions,
        ReturnActions
    >;
};

type Listener<
    RessourceKeyObject extends Record<string, any>,
    PayloadObject extends object = any,
    ReturnActions = string
> = (
    options: ListenerOptions<RessourceKeyObject, PayloadObject>
) => SingleClientOutputAction<PayloadObject, ReturnActions> | void;

type Handler<
    RessourceKeyObject extends Record<string, any>,
    PayloadObject extends object = any,
    ReturnActions = string
> = {
    listener: Listener<RessourceKeyObject, PayloadObject, ReturnActions>;
    payloadType?: Instantiable<PayloadObject>;
    accessLevel?: RessourceAccessLevel;
};

export type ListenerOptions<
    RessourceKeyObject extends Record<string, any> = {},
    PayloadObject extends object = any
> = {
    payload: PayloadObject;
    key: RessourceKeyObject;
    socket: WebSocket;
    user: UserInfos;
};

type OnOptions<PayloadObject extends object = any> = {
    payloadType?: Instantiable<PayloadObject>;
    accessLevel?: RessourceAccessLevel;
};

export class Controller<
    RessourceKeyObject extends Record<string, any> = {},
    InputActions = string,
    OutputActions = string,
    ReturnActions = string
> {
    public wsHandlers: Map<
        string,
        Handler<RessourceKeyObject, any, ReturnActions>
    >;

    private config: ControllerConfig<RessourceKeyObject>;
    private socketManager: WebSocketManager<
        RessourceKeyObject,
        OutputActions,
        ReturnActions
    >;

    constructor({
        topic,
        key,
        guards,
        socketManager,
    }: ControllerOptions<RessourceKeyObject, OutputActions, ReturnActions>) {
        this.socketManager =
            socketManager ??
            new WebSocketManager<
                RessourceKeyObject,
                OutputActions,
                ReturnActions
            >();
        this.wsHandlers = new Map();
        this.config = {
            topic,
            key: key,
            guards: guards,
        };
    }

    get topic(): string {
        return this.config.topic;
    }

    send<PayloadObject extends object = any>(
        socket: WebSocket,
        action: SingleClientOutputAction<PayloadObject, OutputActions>
    ) {
        this.socketManager.send(socket, action);
    }

    emit(
        action: MultipleClientsOutputAction<RessourceKeyObject, OutputActions>
    ) {
        this.socketManager.emit(action);
    }

    on(
        action: InputActions,
        listener: Listener<RessourceKeyObject, any, ReturnActions>,
        options?: OnOptions
    ): this {
        this.wsHandlers.set(action as string, {
            listener,
            payloadType: options?.payloadType,
            accessLevel: options?.accessLevel,
        });
        return this;
    }

    private handleMessage(
        socket: WebSocket,
        key: RessourceKeyObject,
        user: UserInfos,
        message: string
    ): void {
        try {
            let { actionId, payload } = JSON.parse(
                message
            ) as InputAction<RessourceKeyObject>;
            const handler = this.wsHandlers.get(actionId);
            if (handler) {
                // payload validation
                if (handler.payloadType) {
                    const dtoPayload = new handler.payloadType();
                    Object.assign(dtoPayload, payload);
                    const validationErrors = validateSync(dtoPayload);
                    if (validationErrors.length > 0) {
                        this.socketManager.send(socket, {
                            actionId: "error",
                            payload: validationErrors,
                        });
                    }
                    payload = dtoPayload;
                }
                //TODO: user validation
                // listener options prep
                const listenerOptions: ListenerOptions<RessourceKeyObject> = {
                    payload,
                    key: key ?? ({} as any),
                    socket,
                    user,
                };
                // payload validation
                if (
                    handler.accessLevel !== undefined &&
                    this.config.guards?.length
                ) {
                    const highestAccessLevel = this.config.guards
                        .map((guard) => guard.validate(listenerOptions))
                        .sort((a, b) => b - a)[0];
                    if (highestAccessLevel < handler.accessLevel) {
                        this.socketManager.send(socket, {
                            actionId: "error",
                            payload: new AccessRefused(),
                        });
                        return;
                    }
                }
                // if user with payload is authorized
                const result = handler.listener(listenerOptions);
                if (result) {
                    this.socketManager.send(socket, result);
                    return;
                }
            }
        } catch {
            console.error(
                `BAD MESSAGE RECEIVED / on path : "${this.topic}" / with payload : "${message}"`
            );
        }
    }

    subscribe(
        socket: WebSocket,
        { user, key }: { key: RessourceKeyObject; user: UserInfos }
    ): void | ValidationError[] {
        if (key && Object.keys(key).length > 0 && this.config.key) {
            const keyDto = new this.config.key();
            Object.assign(keyDto, key);
            const validationErrors = validateSync(keyDto);
            if (validationErrors.length > 0) {
                return validationErrors;
            }
            key = keyDto;
        }
        socket.on("message", (data) =>
            this.handleMessage(socket, key, user, data.toString())
        );
        socket.on("close", (): void => {
            this.socketManager.unset(user.id);
        });
        this.socketManager.clients.set(user.id, { socket, key });
    }
}
