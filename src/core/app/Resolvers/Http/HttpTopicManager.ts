/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { Logger, TokenInvalidError, TokenService } from "../../Providers";
import { HttpError, HttpTokenInvalid } from "../../../errors";
import { HttpListenerOptions } from "../../Controller/HttpController";
import { PeregrinToken } from "../../Types/Token";
export class HttpTopicManager<
    ListenerOptions extends HttpListenerOptions & { [key: string]: any },
> {
    constructor(
        private readonly handler: {
            listener: (options: ListenerOptions) => Promise<any | HttpError>;
            authenticated?: boolean;
        },
        private readonly logger: Logger,
        private readonly tokenService: TokenService
    ) {}

    private async authenticate(
        req: Request
    ): Promise<
        HttpTokenInvalid | { newToken?: string; token?: PeregrinToken }
    > {
        if (this.handler.authenticated === false) {
            return {};
        }
        const authenticated = this.tokenService.authenticate(
            String(req.headers["token"])
        );
        if (authenticated instanceof TokenInvalidError) {
            return new HttpTokenInvalid();
        }
        return authenticated;
    }

    async get(req: Request, res: Response): Promise<void> {
        const authenticateResponse = await this.authenticate(req);
        if (authenticateResponse instanceof HttpTokenInvalid) {
            res.send(authenticateResponse);
            return;
        }
        const { token, newToken } = authenticateResponse;
        if (newToken) {
            res.setHeader("token", newToken);
        }
        const { params, query, headers } = req;
        res.send(
            await this.handler.listener({
                params,
                query,
                headers,
                token,
                res,
                req,
            } as any)
        );
    }

    async post(req: Request, res: Response): Promise<void> {
        const authenticateResponse = await this.authenticate(req);
        if (authenticateResponse instanceof HttpTokenInvalid) {
            res.send(authenticateResponse);
            return;
        }
        const { token, newToken } = authenticateResponse;
        if (newToken) {
            res.setHeader("token", newToken);
        }
        const { params, body } = req;

        const response: any | HttpError = await this.handler.listener({
            params,
            body,
            token,
            res,
            req,
        } as any);
        if (response instanceof HttpError) {
            res.status(response.code).send(
                response.message ?? "Unexpected Error"
            );
        } else {
            res.send(response);
        }
    }
}
