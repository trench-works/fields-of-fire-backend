import express from "express";
import { Express } from "express";
import expressWs from "express-ws";
import { Controller } from "./Controller";
import { Server } from "http";

export type AppConfig = {
    port: number;
    controllers: Controller[];
};

export class App {
    public app: Express;
    public server: Server;
    public socket: expressWs.Instance;

    constructor(private readonly config: AppConfig) {
        this.server = undefined;
        this.app = express();
        this.socket = expressWs(this.app);
        //apply controllers
        for (const controller of this.config.controllers) {
            this.socket.app.ws(controller.path, (ws, _req) => {
                for (const handler of controller.onHandlers) {
                    ws.on(handler.event, handler.listener);
                }
            });
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
