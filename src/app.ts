import { App } from "./core/app/App";
import { MenuModule } from "./modules/Menu/MenuModule";
import { LobbyModule } from "./modules/Lobby/LobbyModule";
import { GameModule } from "./modules/Game/GameModule";

const server = new App({
    modules: [MenuModule, LobbyModule, GameModule],
    port: process.env.APP_PORT ? Number(process.env.APP_PORT) : 3000,
});
server.start();
