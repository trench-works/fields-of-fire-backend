import { App } from "./core";
import { MenuModule } from "./modules/Menu/MenuModule";
import { LobbyModule } from "./modules/Lobby/LobbyModule";
import { GameModule } from "./modules/Game/GameModule";
import { PlayerModule } from "./modules/Player/PlayerModule";
import { ConfigMap } from "./config/ConfigMap";
import { RedisConnector } from "./core/app/Database/Redis";
import { HotConnectorProvider } from "./core/app/Database/HotDB";
import { UserModule } from "./modules/User/UserModule";
import { MongoConnector } from "./core/app/Database/Mongo";
import { ColdConnectorProvider } from "./core/app/Database/ColdDB";

const server = new App({
    providers: [
        {
            name: HotConnectorProvider,
            provider: (configService) => new RedisConnector(configService.getConfig().redis)
        },
        {
            name: ColdConnectorProvider,
            provider: (configService) => new MongoConnector(configService.getConfig().mongo)
        }
    ],
    modules: [MenuModule, LobbyModule, GameModule, PlayerModule, UserModule],
    appConfig: (configService) => configService.getConfig().app,
    config: ConfigMap,
});
server.start();
