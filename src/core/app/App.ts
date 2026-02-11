import express from "express";
import { Express } from "express";
import expressWs from "express-ws";
import { Controller } from "./Controller";
import { Server } from "http";

type ControllerConstructor = { new (): Controller };

export type AppConfig = {
    port: number;
    controllers: ControllerConstructor[];
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
        for (const controllerInit of this.config.controllers) {
            const controller = new controllerInit();
            this.controllers.push(controller);
            this.socket.app.ws(
                controller.path,
                controller.subscribe.bind(controller)
            );
        }
    }

    start(): Server {
        this.server = this.app.listen(this.config.port, () => {
            return console.log(
                `Express is listening at http://localhost:${this.config.port}`
            );
        });
        return this.server;
    }

    stop() {
        this.server.close();
    }
}
