import { Request, Response } from "express";
import { Logger } from "../../Providers";
import { HttpError } from "../../../errors";
export class HttpTopicManager<
    Handler extends {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        listener: (...params: any[]) => Promise<void | HttpError>;
    },
> {
    constructor(
        private readonly handler: Handler,
        private readonly logger: Logger
    ) {}

    async get(req: Request, res: Response): Promise<void> {
        const { params, query } = req;
        res.send(
            await this.handler.listener({
                params,
                query,
            })
        );
    }

    async post(req: Request, res: Response): Promise<void> {
        const { params, body } = req;
        res.send(
            await this.handler.listener({
                params,
                body,
            })
        );
    }
}
