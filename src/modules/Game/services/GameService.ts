import {
  AccessRefused,
  NotFoundError,
  Provide,
  SocketError,
  HotRessource,
  DBError,
} from "../../../core";
import { Player } from "../../Player/data/Player";
import { Game } from "../data/Game";
import { GameDataManager } from "../data/GameRepository";
import { Entity } from "../data/Entity";
import { v4 as uuid } from "uuid";

export class GameService {
  constructor(
    @Provide(GameDataManager)
    private readonly gameDataManager: HotRessource<Game>,
  ) {}

  async subscribe(
    userId: string,
    gameId: string,
    characterClassId: string,
  ): Promise<
    SocketError | { game: Game; player: Player; playerEntity: Entity }
  > {
    const game = await this.gameDataManager.get(gameId);
    if (!game || game instanceof DBError) {
      return new NotFoundError();
    }
    const player = game.players.find((player) => player.userId === userId);

    if (player) {
      // user is already a player -> so handle data finding
      const playerEntity = game.entities.find(
        (e) => e.entityId === player.entityId,
      );
      if (playerEntity) {
        return { game, player, playerEntity };
      }
    } else {
      // user is joining this game for the first time
      const playerId = uuid().toString();
      const entityId = uuid().toString();

      const player: Player = { userId, gameId, playerId, entityId };
      game.players.push(player);

      const entity: Entity = {
        entityId,
        position: { x: 0, y: 0 },
        characterClassId,
      };
      game.entities.push(entity); // TODO plutot essayer de calculer la première position disponible sur le plateau

      game.plateau[0][0].entityId = entityId;
      return { game, player, playerEntity: entity };
    }

    return new AccessRefused();
  }
}
