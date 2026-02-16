import { WebSocket } from "ws";
import { RessourceKey } from "./interfaces/RessourceKey";
import { InputAction, OutputAction } from "../types/Action";

type RessourceClient<RessourceKeyObject extends Record<string, any>> = {
    socket: WebSocket;
    key: RessourceKeyObject;
};

export class WebSocketManager<
    RessourceKeyObject extends Record<string, any> = {}
> {
    public clients: Map<string, RessourceClient<RessourceKeyObject>>;

    constructor() {
        this.clients = new Map();
    }

    set(userId: string, { socket, key }: RessourceClient<RessourceKeyObject>) {
        if (this.clients.has(userId)) {
            return;
        }
        this.clients.set(userId, { socket, key });
    }

    unset(userId: string) {
        if (!this.clients.has(userId)) {
            return;
        }
        this.clients.delete(userId);
    }

    send(socket: WebSocket, action: OutputAction<RessourceKeyObject>) {
        try {
            const message = JSON.stringify(action);
            socket.send(message);
        } catch {
            console.error("CANT SEND PAYLOAD", action);
        }
    }

    emit(action: OutputAction<RessourceKeyObject>) {
        for (const client of this.clients.values()) {
            if (
                !action.key ||
                RessourceKey.compareKeys<RessourceKeyObject>(
                    client.key,
                    action.key
                )
            ) {
                this.send(client.socket, action);
            }
        }
    }
}
