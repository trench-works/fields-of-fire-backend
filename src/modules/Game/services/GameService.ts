import {
    AccessRefused,
    NotFoundError,
    Provide,
    SocketError,
    HotRessource,
    DBError
} from "../../../core";
import { Player } from "../../Player/data/Player";
import { Game } from "../data/Game";
import { GameDataManager } from "../data/GameRepository";
import { Entity } from "../data/Entity";

export class GameService {
    constructor(
        @Provide(GameDataManager)
        private readonly gameDataManager: HotRessource<Game>
    ) {}

    async subscribe(
        userId: string,
        gameId: string
    ): Promise<SocketError | { game: Game; player: Player, playerEntity : Entity}> {
        const game = await this.gameDataManager.get(gameId);
        if ( !game || game instanceof DBError) {
            return new NotFoundError();
        }
        const player = game.players.find((player) => player.playerId === userId);
        
        if (player) {
            const playerEntity = game.entities.find(e => e.entityId === player.entityId);
            if (playerEntity) {
                return { game, player, playerEntity };
            }
        }

        return new AccessRefused();
    }
}
