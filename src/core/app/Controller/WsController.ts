/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import { WebSocket } from "ws";
import { Instantiable } from "../Types/Instantiable";
import { validateSync, ValidationError } from "class-validator";
import { IGuard, RessourceAccessLevel } from "../Providers/Guard";
import { AccessRefused, SocketError } from "../../errors";
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
    ReturnActions,
> = {
    topic: string;
    key: Instantiable<RessourceKeyObject>;
    guards?: IGuard[];
    socketManager: WsManager<RessourceKeyObject, OutputActions, ReturnActions>;
};

type WsBaseListener<
    RessourceKeyObject extends Record<string, unknown>,
    PayloadResponseObject extends object = object,
    ReturnActions = string,
> = (
    options: WsBaseListenerOptions<RessourceKeyObject>
) => Promise<SingleClientOutputAction<
    PayloadResponseObject,
    ReturnActions
> | void>;

type WsListener<
    RessourceKeyObject extends Record<string, unknown>,
    PayloadObject extends object = object,
    PayloadResponseObject extends object = object,
    ReturnActions = string,
> = (
    options: WsListenerOptions<RessourceKeyObject, PayloadObject>
) => Promise<SingleClientOutputAction<
    PayloadResponseObject,
    ReturnActions
> | void>;

type WsBaseHandler<
    RessourceKeyObject extends Record<string, unknown>,
    PayloadResponseObject extends object = object,
    ReturnActions = string,
> = {
    listener: WsBaseListener<
        RessourceKeyObject,
        PayloadResponseObject,
        ReturnActions
    >;
    responsePayloadType?: Instantiable<PayloadResponseObject>;
};

type WsHandler<
    RessourceKeyObject extends Record<string, unknown>,
    PayloadObject extends object = object,
    PayloadResponseObject extends object = object,
    ReturnActions = string,
> = {
    listener: WsListener<
        RessourceKeyObject,
        PayloadObject,
        PayloadResponseObject,
        ReturnActions
    >;
    payloadType?: Instantiable<PayloadObject>;
    responsePayloadType?: Instantiable<PayloadResponseObject>;
    accessLevel?: RessourceAccessLevel;
};

export type WsBaseListenerOptions<
    RessourceKeyObject extends Record<string, any> = {},
> = {
    key: RessourceKeyObject;
    socket: WebSocket;
    user: UserInfos;
};

export type WsListenerOptions<
    RessourceKeyObject extends Record<string, any> = {},
    PayloadObject extends object = object,
> = WsBaseListenerOptions<RessourceKeyObject> & {
    payload: PayloadObject;
};

type OnOptions<
    PayloadObject extends object = object,
    PayloadResponseObject extends object = object,
> = {
    payloadType?: Instantiable<PayloadObject>;
    responsePayloadType?: Instantiable<PayloadResponseObject>;
    accessLevel?: RessourceAccessLevel;
};

export class WsController<
    RessourceKeyObject extends Record<string, any> = any,
    InputActions = any,
    OutputActions = any,
    ReturnActions = any,
> {
    private readonly _isWsController = true;

    static isWsController(obj: any): obj is WsController {
        return (obj as WsController)._isWsController === true;
    }

    public onSubscribeWsHandlers: WsBaseHandler<
        RessourceKeyObject,
        any,
        ReturnActions
    >[];

    public wsHandlers: Map<
        string,
        WsHandler<RessourceKeyObject, any, any, ReturnActions>
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
        this.onSubscribeWsHandlers = [];
        this.config = {
            topic,
            key,
            guards: guards,
        };
    }

    get topic(): string {
        return this.config.topic;
    }

    send<PayloadResponseObject extends object = object>(
        socket: WebSocket,
        action: SingleClientOutputAction<PayloadResponseObject, OutputActions>
    ) {
        this.socketManager.send(socket, action);
    }

    emit<T extends object>(
        action: MultipleClientsOutputAction<
            RessourceKeyObject,
            OutputActions,
            T
        >
    ) {
        this.socketManager.emit(action);
    }

    on<
        PayloadObject extends object = object,
        PayloadResponseObject extends object = object,
    >(
        action: InputActions,
        listener: WsListener<
            RessourceKeyObject,
            PayloadObject,
            PayloadResponseObject,
            ReturnActions
        >,
        options?: OnOptions<PayloadObject, PayloadResponseObject>
    ): this {
        this.wsHandlers.set(action as string, {
            listener,
            ...options,
        });
        return this;
    }

    onSubscribe<PayloadResponseObject extends object = object>(
        listener: WsBaseListener<
            RessourceKeyObject,
            PayloadResponseObject,
            ReturnActions
        >
    ): this {
        this.onSubscribeWsHandlers.push({
            listener,
        });
        return this;
    }

    private async handleMessage(
        socket: WebSocket,
        key: RessourceKeyObject,
        user: UserInfos,
        message: string
    ): Promise<void> {
        try {
            const decodedMessage = JSON.parse(message) as InputAction;
            let { payload } = decodedMessage;
            const { actionId } = decodedMessage;
            const handler = this.wsHandlers.get(actionId);
            if (handler) {
                // payload validation
                if (handler.payloadType) {
                    const dtoPayload = plainToInstance(
                        handler.payloadType,
                        payload
                    );
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
                    const highestAccessLevel = (
                        await Promise.all(
                            this.config.guards.map((guard) =>
                                guard.validate(listenerOptions)
                            )
                        )
                    ).sort((a, b) => b - a)[0];
                    if (highestAccessLevel < handler.accessLevel) {
                        this.socketManager.send(socket, {
                            error: new AccessRefused(),
                        });
                        return;
                    }
                }
                // if user with payload is authorized
                try {
                    handler.listener(listenerOptions).then((result) => {
                        if (result) {
                            this.socketManager.send(socket, result);
                        }
                    });
                } catch (err: unknown) {
                    this.socketManager.send(socket, {
                        error: err as SocketError,
                    });
                }
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
        const listenerOptions: WsBaseListenerOptions<RessourceKeyObject> = {
            key,
            socket,
            user,
        };
        this.onSubscribeWsHandlers.forEach((handler) =>
            handler.listener(listenerOptions).then((result) => {
                if (result) {
                    this.socketManager.send(socket, result);
                }
            })
        );
        socket.on("message", (data) =>
            this.handleMessage(socket, key, user, data.toString())
        );
        socket.on("close", (): void => {
            this.socketManager.unset(user.id);
        });
        this.socketManager.clients.set(user.id, { socket, key });
    }
}
