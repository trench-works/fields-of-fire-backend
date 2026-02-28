import { HttpError } from "./HttpError";


export class UnknownError extends HttpError {
    constructor() {
        super(500);
    }
}