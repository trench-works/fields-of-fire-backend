import { PositionUtils } from "../../../game-lib";
import { Entity } from "../../Game/data/Entity";
import { Game } from "../../Game/data/Game";

export class PassiveUtils {
    static getAdjacentEnemies(game: Game, entity: Entity): Entity[] {
        return game.entities.filter(
            (other) =>
                !other.dead &&
                !other.isInvocation &&
                other.teamId !== entity.teamId &&
                PositionUtils.distance(entity.position, other.position) === 1,
        );
    }

    static countAdjacentEnemies(game: Game, entity: Entity): number {
        return this.getAdjacentEnemies(game, entity).length;
    }

    static hasAdjacentEnemy(game: Game, entity: Entity): boolean {
        return this.getAdjacentEnemies(game, entity).length > 0;
    }
}