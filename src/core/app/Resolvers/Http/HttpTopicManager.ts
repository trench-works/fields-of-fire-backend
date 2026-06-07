import { Request, Response } from "express";
import { Logger } from "../../Providers";
import { HttpError } from "../../../errors";
export class HttpTopicManager<
    Handler extends {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        listener: (...params: any[]) => Promise<any | HttpError>;
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response: any | HttpError = await this.handler.listener({
            params,
            body,
        });
        if (response instanceof HttpError) {
            res.status(response.code).send(
                response.message ?? "Unexpected Error"
            );
        } else {
            res.send(response);
        }
    }
}
