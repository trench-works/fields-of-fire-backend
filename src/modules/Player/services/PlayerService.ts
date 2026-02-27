import { AccessRefused, NotFoundError, Provide } from "../../../core";
import { MovePlayer } from "../application/interfaces/MovePlayer";
import { GameDataManager } from "../../Game/data/GameRepository";

export class PlayerService {
    constructor(
        @Provide(GameDataManager)
        private readonly gameDataManager: GameDataManager
    ) {}

    async move(
        userId: string,
        gameId: string,
        movePlayer: MovePlayer
    ):
        Promise<{ x: number; y: number; playerId: string }
        | NotFoundError
        | AccessRefused> {
        const game = await this.gameDataManager.get(gameId);
        if (!game) {
            return new NotFoundError();
        }
        const player = game.players.find((player) => player.userId === userId);
        if (!player) {
            return new AccessRefused();
        }
        //TODO: vérifier que le déplacement qu'on va faire n'est pas supérieur à notre nombre de PM restant
        player.position.x = movePlayer.x;
        player.position.y = movePlayer.y;
        return {
            ...player.position,
            playerId: player.id,
        };
    }
}
