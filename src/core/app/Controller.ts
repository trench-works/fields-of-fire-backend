import { WebSocket } from "ws";
import { Request } from "express";
import { Instantiable } from "../types/Instantiable";
import { validateSync } from "class-validator";
import { IGuard, RessourceAccessLevel } from "./Guard";
import { AccessRefused } from "../errors";

type ControllerConfig<RessourceKeyObject extends object> = {
    topic: string;
    key: Instantiable<RessourceKeyObject>;
    guards?: IGuard[];
};

type ControllerOptions<RessourceKeyObject extends object> = {
    topic: string;
    key?: Instantiable<RessourceKeyObject>;
    guards?: IGuard[];
};

type Listener<
    RessourceKeyObject extends object,
    PayloadObject extends object = any
> = (options: ListenerOptions<RessourceKeyObject, PayloadObject>) => any;

type Action<RessourceKeyObject extends object> = {
    actionId: string;
    key?: RessourceKeyObject;
    payload: any;
    user: UserInfos;
};

type Handler<
    RessourceKeyObject extends object,
    PayloadObject extends object = any
> = {
    listener: Listener<RessourceKeyObject, PayloadObject>;
    payloadType?: Instantiable<PayloadObject>;
    accessLevel?: RessourceAccessLevel;
};

type UserInfos = {
    id: string;
};

export type ListenerOptions<
    RessourceKeyObject extends object = {},
    PayloadObject extends object = any
> = {
    payload: PayloadObject;
    key: RessourceKeyObject;
    socket: WebSocket;
    user: UserInfos;
};

type OnOptions<
    RessourceKeyObject extends object,
    PayloadObject extends object = any
> = {
    payloadType?: Instantiable<PayloadObject>;
    accessLevel?: RessourceAccessLevel;
};

export class Controller<RessourceKeyObject extends object = {}> {
    public clients: Map<string, WebSocket>;
    public wsHandlers: Map<string, Handler<RessourceKeyObject>>;

    private config: ControllerConfig<RessourceKeyObject>;

    constructor({ topic, key, guards }: ControllerOptions<RessourceKeyObject>) {
        this.clients = new Map();
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
        options?: OnOptions<RessourceKeyObject>
    ): this {
        this.wsHandlers.set(action, {
            listener,
            payloadType: options?.payloadType,
            accessLevel: options?.accessLevel,
        });
        return this;
    }

    private handleMessage(socket: WebSocket, message: string): void {
        try {
            let { actionId, key, payload, user } = JSON.parse(
                message
            ) as Action<RessourceKeyObject>;
            const handler = this.wsHandlers.get(actionId);
            if (handler) {
                // key validation
                if (key && Object.keys(key).length > 0 && this.config.key) {
                    const keyDto = new this.config.key();
                    Object.assign(keyDto, payload);
                    const validationErrors = validateSync(keyDto);
                    if (validationErrors.length > 0) {
                        socket.send(JSON.stringify(validationErrors));
                    }
                    key = keyDto;
                }
                // payload validation
                if (handler.payloadType) {
                    const dtoPayload = new handler.payloadType();
                    Object.assign(dtoPayload, payload);
                    const validationErrors = validateSync(dtoPayload);
                    if (validationErrors.length > 0) {
                        socket.send(JSON.stringify(validationErrors));
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
                        socket.send(JSON.stringify(new AccessRefused()));
                        return;
                    }
                }
                // if user with payload is authorized
                const result = handler.listener(listenerOptions);
                if (result) {
                    socket.send(JSON.stringify(result));
                    return;
                }
            }
        } catch {
            console.error(
                `BAD MESSAGE RECEIVED / on path : "${this.topic}" / with payload : "${message}"`
            );
        }
    }

    subscribe(socket: WebSocket, request: Request): void {
        const clientIP = request.socket.remoteAddress ?? "";
        socket.on("message", (data) =>
            this.handleMessage(socket, data.toString())
        );
        //socket.onclose;
        this.clients.set(clientIP, socket);
    }

    emit(action: Action<RessourceKeyObject>) {
        for (const client of this.clients.values()) {
            client.send(JSON.stringify(action));
        }
    }
}
