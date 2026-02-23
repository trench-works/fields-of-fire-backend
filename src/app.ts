import { App } from "./core";
import { MenuModule } from "./modules/Menu/MenuModule";
import { LobbyModule } from "./modules/Lobby/LobbyModule";
import { GameModule } from "./modules/Game/GameModule";
import { PlayerModule } from "./modules/Player/PlayerModule";
import { ConfigMap } from "./config/ConfigMap";

const server = new App({
    modules: [MenuModule, LobbyModule, GameModule, PlayerModule],
    appName: (configService) => configService.getConfig().app.name,
    port: (configService) => configService.getConfig().app.port,
    logLevel: (configService) => configService.getConfig().app.logLevel,
    config: ConfigMap,
});
server.start();
