import express from "express";
import { Express } from "express";
import expressWs from "express-ws";
import { Controller } from "./Controller";
import { Server } from "http";
import { Controllable, Instantiable, Providable } from "../types/Instantiable";
import { DependencyResolver } from "./DependencyResolver";

export type AppConfig = {
    port: number;
    controllers: Controllable[];
    providers: Providable[];
};

export class App {
    public app: Express;
    public server: Server;
    public socket: expressWs.Instance;

    private controllers: Controller[] = [];

    constructor(private readonly config: AppConfig) {
        this.server = undefined;
        this.app = express();
        this.socket = expressWs(this.app);
        //apply controllers
        const controllers = new DependencyResolver({
            controllerClasses: config.controllers,
            providerClasses: config.providers,
        }).build();
        for (const controller of controllers) {
            this.socket.app.ws(
                `/${controller.topic}`,
                controller.subscribe.bind(controller)
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
        this.server.close();
    }
}
