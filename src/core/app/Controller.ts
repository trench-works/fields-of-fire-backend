import { WebSocket } from "ws";

export type ControllerOptions = {
    path: string;
};

type Action = {
    actionId: string;
    payload: any;
};

export class Controller {
    public ws: WebSocket;
    public wsHandlers: Map<String, (payload: any) => void>;

    constructor(private readonly config: ControllerOptions) {
        this.wsHandlers = new Map();
    }

    get path(): string {
        return this.config.path;
    }

    onWs(action: string, listener: (payload: any) => void): this {
        this.wsHandlers.set(action, listener);
        return this;
    }

    handleWS(message: string) {
        try {
            const { actionId, payload } = JSON.parse(message) as Action;
            this.wsHandlers.get(actionId)?.(payload);
        } catch {
            console.error(
                `BAD MESSAGE RECEIVED / on path : "${this.path}" / with payload : "${message}"`
            );
        }
    }

    emit(action: Action) {
        this.ws.send(JSON.stringify(action));
    }
}
