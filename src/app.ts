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
import { CharacterClassModule } from "./modules/CharacterClass/CharacterClassModule";
import { EffectModule } from "./modules/Effect/EffectModule";
import { ActionModule } from "./modules/Action/ActionModule";
import { HttpResolver } from "./core/app/Resolvers/Http/HttpResolver";
import { WsResolver } from "./core/app/Resolvers/WebSocket/WsResolver";

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
    modules: [
        // Game modules
        MenuModule,
        LobbyModule,
        GameModule,
        PlayerModule,
        //Settings modules
        UserModule,
        CharacterClassModule,
        EffectModule,
        ActionModule
    ],
    resolvers: [WsResolver, HttpResolver],
    appConfig: (configService) => configService.getConfig().app,
    config: ConfigMap,
});
server.start();
