import { GameController } from "./api/GameController";
import { App } from "./core/app/App";

const server = new App({ port: 3000, controllers: [GameController] });
server.start();
