import { App } from "./core/app/App";
import { MenuModule } from "./modules/Menu/MenuModule";
import { LobbyModule } from "./modules/Lobby/LobbyModule";
import { GameModule } from "./modules/Game/GameModule";

const server = new App({
    port: 3000,
    modules: [MenuModule, LobbyModule, GameModule],
});
server.start();
