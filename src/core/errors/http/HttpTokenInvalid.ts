import { HttpError } from "./HttpError";

export class HttpTokenInvalid extends HttpError {
    constructor() {
        super(401, "TOKEN_INVALID");
    }
}
