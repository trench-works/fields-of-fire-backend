import { WebSocket } from "ws";
import { RessourceKeyUtil } from "../Utils/RessourceKeyUtil";
import {
    MultipleClientsOutputAction,
    SingleClientOutputAction,
} from "../../types/Action";

type RessourceClient<
    RessourceKeyObject extends Record<string, any> | undefined
> = {
    socket: WebSocket;
    key: RessourceKeyObject;
};

export class WebSocketManager<
    RessourceKeyObject extends Record<string, any> | undefined = undefined,
    OutputActions = string,
    ReturnActions = string
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

    send<PayloadObject extends object = any>(
        socket: WebSocket,
        action: SingleClientOutputAction<
            PayloadObject,
            OutputActions | ReturnActions
        >
    ) {
        try {
            const message = JSON.stringify(action);
            socket.send(message);
        } catch {
            console.error("CANT SEND PAYLOAD", action);
        }
    }

    emit(
        action: MultipleClientsOutputAction<RessourceKeyObject, OutputActions>
    ) {
        for (const client of this.clients.values()) {
            if (RessourceKeyUtil.compareKeys(client.key, action.key)) {
                this.send(client.socket, action);
            }
        }
    }
}
