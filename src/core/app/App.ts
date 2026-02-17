import express from "express";
import { Express } from "express";
import expressWs from "express-ws";
import { Server } from "http";
import { Controllable, Modullable, Providable } from "../types/Instantiable";
import { DependencyResolver } from "./DependencyResolver";
import { ModulesResolver } from "./ModulesResolver";
import { TopicResolver } from "./TopicResolver";

export type AppConfig = {
    port: number;
    controllers?: Controllable[];
    providers?: Providable[];
    modules?: Modullable[];
};

export class App {
    public app: Express;
    public server: Server | undefined;
    public socket: expressWs.Instance;

    constructor(private readonly config: AppConfig) {
        this.server = undefined;
        this.app = express();
        this.socket = expressWs(this.app);
        //apply controllers
        const controllers = new DependencyResolver(
            ModulesResolver.resolve(config)
        ).build();
        const topicManagers = new TopicResolver(controllers).build();
        for (const topicManager of topicManagers) {
            this.socket.app.ws(
                `/${topicManager.topic}`,
                topicManager.open.bind(topicManager)
            );
        }
    }

    start(): Server {
        this.server = this.app.listen(this.config.port, () => {
            return console.log(
                `SocketAPI is ready to talk on http://localhost:${this.config.port}`
            );
        });
        return this.server;
    }

    stop() {
        this.server?.close();
    }
}
