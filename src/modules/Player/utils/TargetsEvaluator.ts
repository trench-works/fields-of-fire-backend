import { Evaluator } from "../../../core";
import { Entity } from "../../Game/data/Entity";
import { Game } from "../../Game/data/Game";

export class TargetsEvaluator extends Evaluator<Entity> {
    constructor(
        protected readonly entity: Entity,
        protected readonly game: Game
    ) {
        super(game.entities);
    }

    protected getKey(value: Entity): string {
        return value.id;
    }
    protected getEvaluation(entity: Entity): number {
        return entity.id === this.entity.id ? 0 : 1;
    }
}
