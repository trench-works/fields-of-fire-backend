import { App, Controller, Logger } from "../..";
import { EnvObject } from "../../Types/Env";
import { Resolver } from "../Resolver";
import { WsTopicManager } from "./WsTopicManager";

export class WsResolver implements Resolver {
    private topicMappedControllers: Map<string, Controller[]> = new Map();
    private logger: Logger | undefined;

    prepare(controllers: Controller[], logger: Logger): this {
        this.logger = logger;
        for (const controller of controllers) {
            if (this.topicMappedControllers.has(controller.topic)) {
                this.topicMappedControllers
                    .get(controller.topic)
                    ?.push(controller);
            } else {
                this.topicMappedControllers.set(controller.topic, [controller]);
            }
        }
        return this;
    }

    apply<Config extends EnvObject>(app: App<Config>): void {
        if (!this.logger) {
            throw new Error("Call prepare function before calling apply");
        }
        for (const [topic, controllers] of this.topicMappedControllers) {
            const topicManager = new WsTopicManager(controllers, this.logger)
            app.socket.app.ws(
                `/${topic}`,
                topicManager.open.bind(topicManager)
            );
        }
    }
}
