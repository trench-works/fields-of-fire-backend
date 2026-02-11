import { WebSocket } from "ws";
import { Request } from "express";

export type ControllerOptions = {
    path: string;
};

type Action = {
    actionId: string;
    payload: any;
};

export class Controller {
    public clients: Map<String, WebSocket>;
    public wsHandlers: Map<String, (payload: any) => void>;

    constructor(private readonly config: ControllerOptions) {
        this.wsHandlers = new Map();
    }

    get path(): string {
        return this.config.path;
    }

    on(action: string, listener: (payload: any) => void): this {
        this.wsHandlers.set(action, listener);
        return this;
    }

    private handleMessage(message: string) {
        try {
            const { actionId, payload } = JSON.parse(message) as Action;
            this.wsHandlers.get(actionId)?.(payload);
        } catch {
            console.error(
                `BAD MESSAGE RECEIVED / on path : "${this.path}" / with payload : "${message}"`
            );
        }
    }

    subscribe(socket: WebSocket, request: Request): void {
        const clientIP = request.socket.remoteAddress;
        socket.on("message", this.handleMessage.bind(this));
        //socket.onclose;
        this.clients.set(clientIP, socket);
    }

    emit(action: Action) {
        for (const client of this.clients.values()) {
            client.send(JSON.stringify(action));
        }
    }
}
