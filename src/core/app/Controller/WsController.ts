/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import { WebSocket } from "ws";
import { Instantiable } from "../Types/Instantiable";
import { validateSync, ValidationError } from "class-validator";
import { IGuard, RessourceAccessLevel } from "../Providers/Guard";
import { AccessRefused } from "../../errors";
import { UserInfos } from "../Types/UserInfos";
import { WsManager } from "../Resolvers/WebSocket/WsManager";
import {
    InputAction,
    MultipleClientsOutputAction,
    SingleClientOutputAction,
} from "../../types/Action";
import { Provide } from "../../decorators";
import { Logger } from "../Providers";
import { plainToInstance } from "class-transformer";

type WsControllerConfig<RessourceKeyObject extends Record<string, unknown>> = {
    topic: string;
    key: Instantiable<RessourceKeyObject>;
    guards?: IGuard[];
};

type WsControllerOptions<
    RessourceKeyObject extends Record<string, unknown>,
    OutputActions,
    ReturnActions
> = {
    topic: string;
    key: Instantiable<RessourceKeyObject>;
    guards?: IGuard[];
    socketManager: WsManager<
        RessourceKeyObject,
        OutputActions,
        ReturnActions
    >;
};

type WsListener<
    RessourceKeyObject extends Record<string, unknown>,
    PayloadObject extends object = object,
    ReturnActions = string
> = (
    options: WsListenerOptions<RessourceKeyObject, PayloadObject>
) => Promise<SingleClientOutputAction<PayloadObject, ReturnActions> | void>;

type WsHandler<
    RessourceKeyObject extends Record<string, unknown>,
    PayloadObject extends object = object,
    ReturnActions = string
> = {
    listener: WsListener<RessourceKeyObject, PayloadObject, ReturnActions>;
    payloadType?: Instantiable<PayloadObject>;
    accessLevel?: RessourceAccessLevel;
};

export type WsListenerOptions<
    RessourceKeyObject extends Record<string, any> = {},
    PayloadObject extends object = object
> = {
    payload: PayloadObject;
    key: RessourceKeyObject;
    socket: WebSocket;
    user: UserInfos;
};

type OnOptions<PayloadObject extends object = object, ResponsePayloadObject extends object = object> = {
    payloadType?: Instantiable<PayloadObject>;
    responsePayloadType?: Instantiable<ResponsePayloadObject>;
    accessLevel?: RessourceAccessLevel;
};

export class WsController<
    RessourceKeyObject extends Record<string, any> = any,
    InputActions = any,
    OutputActions = any,
    ReturnActions = any
> {
    private readonly _isWsController = true;

    static isWsController(obj: any): obj is WsController {
        return (obj as WsController)._isWsController === true;
    }
    
    public wsHandlers: Map<
        string,
        WsHandler<RessourceKeyObject, any, ReturnActions>
    >;

    private config: WsControllerConfig<RessourceKeyObject>;
    protected socketManager: WsManager<
        RessourceKeyObject,
        OutputActions,
        ReturnActions
    >;

    @Provide("Logger") protected logger!: Logger;

    constructor({
        topic,
        key,
        guards,
        socketManager,
    }: WsControllerOptions<RessourceKeyObject, OutputActions, ReturnActions>) {
        this.socketManager = socketManager;
        this.wsHandlers = new Map();
        this.config = {
            topic,
            key,
            guards: guards,
        };
    }

    get topic(): string {
        return this.config.topic;
    }

    send<PayloadObject extends object = object>(
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

    on<PayloadObject extends object = object, ResponsePayloadObject extends object = object>(
        action: InputActions,
        listener: WsListener<RessourceKeyObject, PayloadObject, ReturnActions>,
        options?: OnOptions<PayloadObject, ResponsePayloadObject>
    ): this {
        this.wsHandlers.set(action as string, {
            listener,
            ...options
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
            const decodedMessage = JSON.parse(
                message
            ) as InputAction;
            let {payload} = decodedMessage;
            const {actionId} = decodedMessage;
            const handler = this.wsHandlers.get(actionId);
            if (handler) {
                // payload validation
                if (handler.payloadType) {
                    const dtoPayload = plainToInstance(handler.payloadType, payload);
                    const validationErrors = validateSync(dtoPayload);
                    if (validationErrors.length > 0) {
                        this.logger.error(
                            `ERROR ON PAYLOAD VALIDATION action -> "${actionId}", payload -> "${JSON.stringify(dtoPayload, null, 2)}", errors -> ${JSON.stringify(validationErrors, null, 2)}`
                        );
                        this.socketManager.send(socket, {
                            actionId: "error",
                            payload: validationErrors,
                        });
                    }
                    payload = dtoPayload;
                }
                //TODO: user validation
                // listener options prep
                const listenerOptions: WsListenerOptions<RessourceKeyObject> = {
                    payload,
                    key,
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
                handler.listener(listenerOptions).then((result) => {
                    if (result) {
                        this.socketManager.send(socket, result)
                    }
                })
            }
        } catch (err) {
            this.logger.error(
                `ERROR HAPPENED WHILE RECEIVING MESSAGE "${err}"`
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
