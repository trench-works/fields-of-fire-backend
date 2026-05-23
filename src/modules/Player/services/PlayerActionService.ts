import { Logger, Provide } from "../../../core";
import { Cell } from "../../Game/data/Game";
import { GameDataManager } from "../../Game/data/GameRepository";

export class PlayerActionService {
    constructor(
        @Provide(GameDataManager)
        private readonly gameDataManager: GameDataManager,
        @Provide("Logger") private readonly logger: Logger
    ) {}

    async action(
        actionId: string,
        gameId: string,
        playerId: string,
        target: { x: number; y: number }
    ) {
        this.logger.log("PlayerActionService action method called");

        switch (actionId) {
            case "walk": {
                const game = await this.gameDataManager.get(gameId);
                if (!game) {
                    this.logger.error("Game not found");
                    return null;
                }

                const player = game.players.find(
                    (player) => player.playerId === playerId
                )!;

                const destination = game.plateau[target.x][target.y];
                if (!this.checkDestination(destination)) {
                    this.logger.error("Destination cell is already occupied");
                    return null;
                }

                const foundEntity = game.entities.find(
                    (e) => e.entityId === player!.entityId
                );
                if (!foundEntity) {
                    this.logger.error("Entity not found");
                    return null;
                }

                // Libère l'ancienne case
                const currentCase =
                    game.plateau[foundEntity.position.x][
                        foundEntity.position.y
                    ];
                currentCase.entityId = undefined;
                // Occupe la nouvelle case
                destination.entityId = player.entityId;
                // Met à jour la position
                foundEntity.position = target;

                await this.gameDataManager.set(gameId, game);

                return { entity: foundEntity };
            }
            case "shoot":
                break;
            case "heal":
                break;
            default:
                this.logger.error("Unknown action ID");
        }
    }

    checkDestination(cell: Cell): boolean {
        return Boolean(!cell.entityId && !cell.isHole && !cell.isWall);
    }
}
