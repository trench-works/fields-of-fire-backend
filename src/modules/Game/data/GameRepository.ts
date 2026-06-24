import { Provide, RedisConnector } from "../../../core";
import { RedisRepository } from "../../../core/app/Database/Redis";
import { Game } from "./Game";

export class GameDataManager extends RedisRepository<Game> {
    constructor(
        @Provide(RedisConnector)
        connector: RedisConnector
    ) {
        super("games", connector);
    }
}
