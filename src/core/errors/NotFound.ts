import { SocketError } from "./SocketError";

export class NotFoundError extends SocketError {
    constructor() {
        super("NOT_FOUND");
    }
}
