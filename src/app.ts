import { GameController } from "./api/controllers/GameController";
import { LobbyController } from "./api/controllers/LobbyController";
import { GameService } from "./api/services/GameService";
import { LobbyService } from "./api/services/LobbyService";
import { App } from "./core/app/App";

const server = new App({
    port: 3000,
    controllers: [LobbyController, GameController],
    providers: [LobbyService, GameService],
});
//server.start();
