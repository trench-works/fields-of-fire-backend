import { Logger, Provide } from "../../../core";
import { Game } from "../../Game/data/Game";
import { GameDataManager } from "../../Game/data/GameRepository";

export class PlayerActionService {
  constructor(
    @Provide(GameDataManager)
    private readonly gameDataManager: GameDataManager,
    @Provide("Logger") private readonly logger: Logger,
  ) {}

  async action(actionId: string, gameId: string, playerId: string, target: { x: number; y: number }) {
  this.logger.log("PlayerActionService action method called");
  

  switch (actionId) {
    case 'walk': {
      const game = await this.gameDataManager.get(gameId);
      if (!game) {
        this.logger.error("Game not found");
        return null;
      }

      const player = game.players.find((player) => player.id === playerId);

      const destination = await this.checkDestination(game, target);
      if (destination) {
        this.logger.error("Destination cell is already occupied");
        return null;
      }

      const foundEntity = game.entities.find(e => e.entityId === player!.entity);
      if (!foundEntity) {
        this.logger.error("Entity not found");
        return null;
      }

      // Libère l'ancienne case
      game.plateau[foundEntity.position.y][foundEntity.position.x] = null;
      // Occupe la nouvelle
      game.plateau[target.y][target.x] = { entityId: player!.entity };
      // Met à jour la position
      foundEntity.position = target;

      await this.gameDataManager.set(gameId, game);

      return {entity : foundEntity}
    }
    case 'shoot':
      break;
    case 'heal':
      break;
    default:
      this.logger.error("Unknown action ID");
  }
}

  async checkDestination(game: Game, target: { x: number; y: number }): Promise<string | null> {
    const cell = game.plateau[target.y]?.[target.x];
    return cell?.entityId ?? null;
}
}
