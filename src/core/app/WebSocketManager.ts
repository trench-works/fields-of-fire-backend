import { WebSocket } from "ws";
import { RessourceKey } from "./interfaces/RessourceKey";
import {
    MultipleClientsOutputAction,
    SingleClientOutputAction,
} from "../types/Action";

type RessourceClient<
    RessourceKeyObject extends Record<string, any> | undefined
> = {
    socket: WebSocket;
    key: RessourceKeyObject;
};

export class WebSocketManager<
    RessourceKeyObject extends Record<string, any> | undefined = undefined
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

    send(socket: WebSocket, action: SingleClientOutputAction) {
        try {
            const message = JSON.stringify(action);
            socket.send(message);
        } catch {
            console.error("CANT SEND PAYLOAD", action);
        }
    }

    emit(action: MultipleClientsOutputAction<RessourceKeyObject>) {
        for (const client of this.clients.values()) {
            if (RessourceKey.compareKeys(client.key, action.key)) {
                this.send(client.socket, action);
            }
        }
    }
}
