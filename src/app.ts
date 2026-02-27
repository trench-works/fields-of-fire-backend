import { App } from "./core";
import { MenuModule } from "./modules/Menu/MenuModule";
import { LobbyModule } from "./modules/Lobby/LobbyModule";
import { GameModule } from "./modules/Game/GameModule";
import { PlayerModule } from "./modules/Player/PlayerModule";
import { ConfigMap } from "./config/ConfigMap";
import { RedisConnector } from "./core/app/Database/RedisClient";
import { HotConnectorProvider } from "./core/app/Database/HotDB";

const server = new App({
    providers: [
        {
            name: HotConnectorProvider,
            provider: (configService) => new RedisConnector(configService.getConfig().redis)
        }
    ],
    modules: [MenuModule, LobbyModule, GameModule, PlayerModule],
    appConfig: (configService) => configService.getConfig().app,
    config: ConfigMap,
});
server.start();
