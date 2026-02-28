import { Controller, GetHandler } from "../../Controller/Controller";
import { Logger } from "../../Providers";
import { HttpTopicManager } from "./HttpTopicManager";
import { App } from "../../App";
import { EnvObject } from "../../Types/Env";
import { Resolver } from "../Resolver";

export class HttpResolver implements Resolver {
    private pathMappedControllers: Map<string, GetHandler[]> = new Map();
    private logger: Logger | undefined;

    prepare(controllers: Controller[], logger: Logger): this {
        this.logger = logger;
        for (const controller of controllers) {
            for(const [path, handler] of controller.getHandlers.entries())
            if (this.pathMappedControllers.has(path)) {
                this.pathMappedControllers
                    .get(path)
                    ?.push(handler);
            } else {
                this.pathMappedControllers.set(path, [handler]);
            }
        }
        return this;
    }

    apply<Config extends EnvObject>(app: App<Config>):  void {
        if (!this.logger) {
            throw new Error("Call prepare function before calling apply");
        }
        for (const [path, handlers] of this.pathMappedControllers.entries()) {
            const pathManager = new HttpTopicManager(handlers, this.logger);
            app.app.get(path, pathManager.get.bind(pathManager));
        }
    }
}