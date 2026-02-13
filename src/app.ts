import { GameController } from "./api/controllers/GameController";
import { LobbyController } from "./api/controllers/LobbyController";
import { MenuController } from "./api/controllers/MenuController";
import { GameDataManager } from "./api/data/GameDataManager";
import { GameService } from "./api/services/GameService";
import { LobbyService } from "./api/services/LobbyService";
import { App } from "./core/app/App";

const server = new App({
    port: 3000,
    controllers: [MenuController, LobbyController, GameController],
    providers: [
        /**
         * DataManagers
         */
        GameDataManager,
        /**
         * Services
         */
        LobbyService,
        GameService,
    ],
});
server.start();
