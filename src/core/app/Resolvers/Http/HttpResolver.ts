import { Logger } from "../../Providers";
import { HttpTopicManager } from "./HttpTopicManager";
import { App } from "../../App";
import { EnvObject } from "../../Types/Env";
import { Resolver, ResolverApplier } from "../Resolver";
import { GetHandler, HttpController } from "../../Controller/HttpController";

export class HttpResolver implements Resolver, ResolverApplier {
    private pathMappedControllers: Map<string, GetHandler> = new Map();
    private logger: Logger | undefined;

    prepare(controllers: object[], logger: Logger): this {
        this.logger = logger;
        for (const controller of controllers) {
            if (HttpController.isHttpController(controller)) {
                for (const [path, handler] of controller.getHandlers.entries()) {
                    if (this.pathMappedControllers.has(path)) {
                        throw new Error("Cannot have multiple handlers for same route and action");
                    } else {
                        this.pathMappedControllers.set(path, handler);
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
        for (const [path, handler] of this.pathMappedControllers.entries()) {
            const pathManager = new HttpTopicManager(handler, this.logger);
            app.app.get(path, pathManager.get.bind(pathManager));
        }
    }
}