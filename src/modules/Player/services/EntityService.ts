import { Provide } from "../../../core";
import { Entity } from "../../Game/data/Entity";
import { Cell, Game } from "../../Game/data/Game";
import { GameDataManager } from "../../Game/data/GameRepository";

export class EntityService {
    @Provide(GameDataManager)
    private readonly gameDataManager!: GameDataManager;

    async moveEntity(
        game: Game,
        entity: Entity,
        destination: Cell,
        target: { x: number; y: number }
    ): Promise<Game> {
        // Libère l'ancienne case
        const currentCase = game.plateau[entity.position.x][entity.position.y];
        currentCase.entityId = undefined;
        // Occupe la nouvelle case
        destination.entityId = entity.entityId;
        // Met à jour la position
        entity.position = target;

        await this.gameDataManager.set(game.id, game);
        return game;
    }
}
