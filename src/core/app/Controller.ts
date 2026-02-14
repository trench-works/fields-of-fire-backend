import { WebSocket } from "ws";
import { Request } from "express";
import { Instantiable } from "../types/Instantiable";
import { validateSync } from "class-validator";
import { Guardable } from "../types/Guardable";
import { Guard } from "./Guard";

type ControllerConfig<RessourceKeyObject extends object> = {
    topic: string;
    key?: Instantiable<RessourceKeyObject>;
    guards?: Guard[];
};

type ControllerOptions<RessourceKeyObject extends object> = {
    topic: string;
    key?: Instantiable<RessourceKeyObject>;
    guards?: Guard[];
};

type Listener<RessourceKeyObject extends object> = (
    payload: any,
    key?: RessourceKeyObject
) => any;

type Action<RessourceKeyObject extends object> = {
    actionId: string;
    key?: RessourceKeyObject;
    payload: any;
};

type Handler<RessourceKeyObject extends object> = {
    listener: Listener<RessourceKeyObject>;
    payloadType?: Instantiable;
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
            key,
            guards: [],
        };
    }

    get topic(): string {
        return this.config.topic;
    }

    on(
        action: string,
        listener: Listener<RessourceKeyObject>,
        payloadType?: Instantiable
    ): this {
        this.wsHandlers.set(action, { listener, payloadType });
        return this;
    }

    private handleMessage(socket: WebSocket, message: string) {
        try {
            let { actionId, key, payload } = JSON.parse(
                message
            ) as Action<RessourceKeyObject>;
            const handler = this.wsHandlers.get(actionId);
            if (handler) {
                if (key && Object.keys(key).length > 0 && this.config.key) {
                    const keyDto = new this.config.key();
                    Object.assign(keyDto, payload);
                    const validationErrors = validateSync(keyDto);
                    if (validationErrors.length > 0) {
                        socket.send(JSON.stringify(validationErrors));
                    }
                    key = keyDto;
                }
                if (handler.payloadType) {
                    const dtoPayload = new handler.payloadType();
                    Object.assign(dtoPayload, payload);
                    const validationErrors = validateSync(dtoPayload);
                    if (validationErrors.length > 0) {
                        socket.send(JSON.stringify(validationErrors));
                    }
                    payload = dtoPayload;
                }
                const result = handler.listener(payload, key);
                if (result) {
                    socket.send(JSON.stringify(result));
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
