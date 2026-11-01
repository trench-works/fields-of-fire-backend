import { Logger, TokenService } from "../../Providers";
import { HttpTopicManager } from "./HttpTopicManager";
import { App } from "../../App";
import { EnvObject } from "../../Types/Env";
import { Resolver, ResolverApplier } from "../Resolver";
import {
    GetHandler,
    GetListenerOptions,
    HttpController,
    PostHandler,
    PostListenerOptions,
} from "../../Controller/HttpController";

export class HttpResolver implements Resolver, ResolverApplier {
    private pathMappedGetHandlers: Map<string, GetHandler> = new Map();
    private pathMappedPostHandlers: Map<string, PostHandler> = new Map();
    private logger!: Logger;
    private tokenService!: TokenService;

    prepare(
        controllers: object[],
        logger: Logger,
        tokenService: TokenService
    ): this {
        this.logger = logger;
        this.tokenService = tokenService;
        for (const controller of controllers) {
            if (HttpController.isHttpController(controller)) {
                for (const [
                    path,
                    handler,
                ] of controller.getHandlers.entries()) {
                    if (this.pathMappedGetHandlers.has(path)) {
                        throw new Error(
                            "Cannot have multiple handlers for same route and action"
                        );
                    } else {
                        this.pathMappedGetHandlers.set(path, handler);
                    }
                }
                for (const [
                    path,
                    handler,
                ] of controller.postHandlers.entries()) {
                    if (this.pathMappedPostHandlers.has(path)) {
                        throw new Error(
                            "Cannot have multiple handlers for same route and action"
                        );
                    } else {
                        this.pathMappedPostHandlers.set(path, handler);
                    }
                }
            }
        }
        return this;
    }

    apply<Config extends EnvObject>(app: App<Config>): void {
        if (!this.logger) {
            throw new Error("Call prepare function before calling apply");
        }
        for (const [path, handler] of this.pathMappedGetHandlers.entries()) {
            const pathManager = new HttpTopicManager<GetListenerOptions>(
                handler,
                this.logger,
                this.tokenService
            );
            app.app.get(path, pathManager.get.bind(pathManager));
        }
        for (const [path, handler] of this.pathMappedPostHandlers.entries()) {
            const pathManager = new HttpTopicManager<PostListenerOptions>(
                handler,
                this.logger,
                this.tokenService
            );
            app.app.post(path, pathManager.post.bind(pathManager));
        }
    }
}
