import { SocketError } from "../../../../core";

export class GameCreationError extends SocketError {
    constructor() {
        super("Failed to create Game !");
    }
}
