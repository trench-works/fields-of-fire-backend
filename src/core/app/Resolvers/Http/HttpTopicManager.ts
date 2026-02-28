import { Request, Response } from "express"
import { GetHandler } from "../../Controller/HttpController"
import { Logger } from "../../Providers"
export class HttpTopicManager {

    constructor(
        private readonly handler: GetHandler,
        private readonly logger: Logger
    ) {}

    async get(req: Request, res: Response): Promise<void> {
        const { params, query } = req;
        res.send(await this.handler.listener({
            params,
            query
        }));
    }
}