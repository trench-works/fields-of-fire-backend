import { App, WsController, Logger, TokenService } from "../..";
import { EnvObject } from "../../Types/Env";
import { Resolver, ResolverApplier } from "../Resolver";
import { WsTopicManager } from "./WsTopicManager";

export class WsResolver implements Resolver, ResolverApplier {
    private topicMappedControllers: Map<string, WsController[]> = new Map();
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
            if (WsController.isWsController(controller)) {
                if (this.topicMappedControllers.has(controller.topic)) {
                    this.topicMappedControllers
                        .get(controller.topic)
                        ?.push(controller);
                } else {
                    this.topicMappedControllers.set(controller.topic, [
                        controller,
                    ]);
                }
            }
        }
        return this;
    }

    apply<Config extends EnvObject>(app: App<Config>): void {
        if (!this.logger) {
            throw new Error("Call prepare function before calling apply");
        }
        for (const [
            topic,
            controllers,
        ] of this.topicMappedControllers.entries()) {
            const topicManager = new WsTopicManager(
                controllers,
                this.logger,
                this.tokenService,
                topic
            );
            app.socket.app.ws(
                `/${topic}`,
                topicManager.open.bind(topicManager)
            );
        }
    }
}
