import { SocketError } from "./SocketError";

export class AccessRefused extends SocketError {
    constructor() {
        super("ACCESS_REFUSED");
    }
}
