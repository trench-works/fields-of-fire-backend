import { Controller, TopicManager } from "..";

export class TopicResolver {
    private topicMappedControllers: Map<string, Controller[]> = new Map();

    constructor(controllers: Controller[]) {
        for (const controller of controllers) {
            if (this.topicMappedControllers.has(controller.topic)) {
                this.topicMappedControllers
                    .get(controller.topic)
                    ?.push(controller);
            } else {
                this.topicMappedControllers.set(controller.topic, [controller]);
            }
        }
    }

    build(): TopicManager[] {
        return Array.from(this.topicMappedControllers.entries()).map(
            ([topic, controllers]) => new TopicManager(topic, controllers)
        );
    }
}
