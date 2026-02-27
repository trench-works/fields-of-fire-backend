import { DBError } from "./DBError";



export class NoClientError extends DBError {
    constructor() {
        super("NO_CLIENT")
    }
}