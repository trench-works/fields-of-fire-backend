import { App } from "./core";
import { MenuModule } from "./modules/Menu/MenuModule";
import { LobbyModule } from "./modules/Lobby/LobbyModule";
import { GameModule } from "./modules/Game/GameModule";
import { PlayerModule } from "./modules/Player/PlayerModule";

const server = new App({
    modules: [MenuModule, LobbyModule, GameModule, PlayerModule],
    port: process.env.APP_PORT ? Number(process.env.APP_PORT) : 3000,
});
server.start();
