import { SocketError } from "./SocketError";

export class SocketBadRequest extends SocketError {
    constructor(message?: string) {
        super("ACTION_IMPOSSIBLE", message);
    }
}
