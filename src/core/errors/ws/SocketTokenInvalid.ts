import { SocketError } from "./SocketError";

export class SocketTokenInvalid extends SocketError {
    constructor() {
        super("TOKEN_INVALID");
    }
}
