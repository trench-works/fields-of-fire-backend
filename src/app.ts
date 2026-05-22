import {
    App,
    HttpResolver,
    WsResolver,
    ColdConnectorProvider,
    HotConnectorProvider,
    MongoConnector,
    RedisConnector
} from "./core";
import { MenuModule } from "./modules/Menu/MenuModule";
import { LobbyModule } from "./modules/Lobby/LobbyModule";
import { GameModule } from "./modules/Game/GameModule";
import { PlayerModule } from "./modules/Player/PlayerModule";
import { ConfigMap } from "./config/ConfigMap";
import { UserModule } from "./modules/User/UserModule";
import { CharacterClassModule } from "./modules/CharacterClass/CharacterClassModule";
import { EffectModule } from "./modules/Effect/EffectModule";
import { ActionModule } from "./modules/Action/ActionModule";

import * as dotenv from "dotenv";


if (process.env.ENV !== "PROD") {
    dotenv.config({ path: [__dirname + "/../env/.env.local"] });
}

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
