import { GameController } from "./api/GameController";
import { App } from "./core/app/App";
import { Controller } from "./core/app/Controller";

const server = new App({ port: 3000, controllers: [new GameController()] });
server.start();
