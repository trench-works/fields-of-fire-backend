import {
    App,
    HttpResolver,
    WsResolver,
    HotConnectorProvider,
    RedisConnector,
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
import { PostgresConnector } from "./core/app/Database/Postgres";
import { UserEntity } from "./modules/User/data/UserEntity";

if (process.env.ENV !== "PROD") {
    dotenv.config({ path: [__dirname + "/../env/.env.local"] });
}

const server = new App({
    providers: [
        {
            name: HotConnectorProvider,
            provider: (configService) =>
                new RedisConnector(configService.getConfig().redis),
        },
        {
            name: PostgresConnector,
            provider: (configService) =>
                new PostgresConnector(
                    configService.getConfig().postgres
                ).getClient([UserEntity]),
        },
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
        ActionModule,
    ],
    resolvers: [WsResolver, HttpResolver],
    appConfig: (configService) => configService.getConfig().app,
    config: ConfigMap(),
});
server.start();
