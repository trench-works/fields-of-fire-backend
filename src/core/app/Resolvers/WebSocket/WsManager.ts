import { WebSocket } from "ws";
import { RessourceKeyUtils } from "../../Utils";
import {
    MultipleClientsOutputAction,
    SingleClientOutputAction,
} from "../../../types/Action";
import { Provide } from "../../../decorators";
import { Logger } from "../../Providers";
import { ValidationError } from "class-validator";

export type RessourceClient<
    RessourceKeyObject extends Record<string, unknown>,
> = {
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
        const existing = this.clients.get(userId);
        if (existing && existing.socket.readyState === WebSocket.OPEN) {
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
        action:
            | SingleClientOutputAction<
                  PayloadObject,
                  OutputActions | ReturnActions
              >
            | ValidationError[]
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!action) {
                resolve();
                return;
            }

            if (socket.readyState !== 1) {
                this.logger.error(
                    `SOCKET NOT OPEN, readyState: ${socket.readyState}`
                );
                resolve();
                return;
            }

            try {
                let message: string = "";
                if (Object.keys(action).includes("actionId")) {
                    message = JSON.stringify(action);
                } else {
                    message = JSON.stringify({
                        actionId: "error",
                        error: action,
                    });
                }
                socket.send(message, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            } catch {
                this.logger.error("CANT SEND PAYLOAD", JSON.stringify(action));
                reject();
            }
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async emitMap<PayloadObject extends object = any>(
        actionId: OutputActions,
        key: Partial<RessourceKeyObject>,
        getPayload: (
            client: RessourceClient<RessourceKeyObject>,
            index: number
        ) => PayloadObject
    ): Promise<void> {
        const promises: Promise<void>[] = [];
        let i = 0;
        for (const client of this.clients.values()) {
            if (RessourceKeyUtils.compareKeys(client.key, key)) {
                promises.push(
                    this.send(client.socket, {
                        actionId,
                        payload: getPayload(client, i),
                    })
                );
            }
            i++;
        }
        await Promise.all(promises);
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
