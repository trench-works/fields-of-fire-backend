import { WebSocket } from "ws";
import { Request } from "express";
import { Instantiable } from "../types/Instantiable";
import { validateSync, ValidationError } from "class-validator";
import { IGuard, RessourceAccessLevel } from "./Guard";
import { AccessRefused } from "../errors";
import { UserInfos } from "./interfaces/UserInfos";
import { WebSocketManager } from "./WebSocketManager";
import { InputAction } from "../types/Action";
import { RessourceKey } from "./interfaces/RessourceKey";

type ControllerConfig<RessourceKeyObject extends Record<string, any>> = {
    topic: string;
    key: Instantiable<RessourceKeyObject>;
    guards?: IGuard[];
};

type ControllerOptions<RessourceKeyObject extends Record<string, any>> = {
    topic: string;
    key?: Instantiable<RessourceKeyObject>;
    guards?: IGuard[];
    socketManager?: WebSocketManager<RessourceKeyObject>;
};

type Listener<
    RessourceKeyObject extends Record<string, any>,
    PayloadObject extends object = any
> = (options: ListenerOptions<RessourceKeyObject, PayloadObject>) => any;

type Handler<
    RessourceKeyObject extends Record<string, any>,
    PayloadObject extends object = any
> = {
    listener: Listener<RessourceKeyObject, PayloadObject>;
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

export class Controller<RessourceKeyObject extends Record<string, any> = {}> {
    public wsHandlers: Map<string, Handler<RessourceKeyObject>>;

    private config: ControllerConfig<RessourceKeyObject>;
    protected socketManager: WebSocketManager<RessourceKeyObject>;

    constructor({
        topic,
        key,
        guards,
        socketManager,
    }: ControllerOptions<RessourceKeyObject>) {
        this.socketManager = socketManager ?? new WebSocketManager();
        this.wsHandlers = new Map();
        this.config = {
            topic,
            key: key ?? ({} as any),
            guards: guards,
        };
    }

    get topic(): string {
        return this.config.topic;
    }

    on(
        action: string,
        listener: Listener<RessourceKeyObject>,
        options?: OnOptions
    ): this {
        this.wsHandlers.set(action, {
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
        console.log("TRYING TO CONNECT ONE CONTROLLER");
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
