import { NextFunction, Request, Response } from "express"
import { GetHandler } from "../../Controller/HttpController"
import { Logger } from "../../Providers"

type GetOptions = {
    req: Request,
    res: Response,
    next: NextFunction,
}

export class HttpTopicManager {

    constructor(
        private readonly handlers: GetHandler[],
        private readonly logger: Logger
    ) {}

    get({
        req,
        res
    }: GetOptions) {
        console.log(req, res);
    }
}