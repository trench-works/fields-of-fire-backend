import { WebSocket } from "ws";
import { RessourceKeyUtils } from "../../Utils";
import {
    MultipleClientsOutputAction,
    SingleClientOutputAction,
} from "../../../types/Action";
import { Provide } from "../../../decorators";
import { Logger } from "../../Providers";
import { SocketError } from "../../../errors";

type RessourceClient<RessourceKeyObject extends Record<string, unknown>> = {
    socket: WebSocket;
    key: RessourceKeyObject;
};

export class WsManager<
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any
    RessourceKeyObject extends Record<string, any> = {},
    OutputActions = string,
    ReturnActions = string,
> {
    public clients: Map<string, RessourceClient<RessourceKeyObject>>;

    @Provide("Logger") logger!: Logger;

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

    async send<PayloadObject extends object = object>(
        socket: WebSocket,
        action: SingleClientOutputAction<
            PayloadObject,
            OutputActions | ReturnActions
        >
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                let message = "";
                if (action instanceof SocketError) {
                    message = JSON.stringify({ error: action });
                } else {
                    message = JSON.stringify(action);
                }
                socket.send(message, () => resolve());
            } catch {
                this.logger.error("CANT SEND PAYLOAD", JSON.stringify(action));
                reject();
            }
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async emit<PayloadObject extends object = any>(
        action: MultipleClientsOutputAction<
            RessourceKeyObject,
            OutputActions,
            PayloadObject
        >
    ): Promise<void> {
        const promises: Promise<void>[] = [];
        for (const client of this.clients.values()) {
            if (RessourceKeyUtils.compareKeys(client.key, action.key)) {
                promises.push(this.send(client.socket, action));
            }
        }
        await Promise.all(promises);
    }
}
