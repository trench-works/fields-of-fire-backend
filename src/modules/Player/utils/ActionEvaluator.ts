import { Evaluator } from "../../../core";
import { Action } from "../../Action/data/Action";
import { Entity } from "../../Game/data/Entity";
import { Game } from "../../Game/data/Game";

export class ActionEvaluator extends Evaluator<Action> {
    constructor(
        protected readonly entity: Entity,
        protected readonly actions: Action[],
        protected readonly game: Game
    ) {
        super(actions);
    }

    protected getKey(value: Action): string {
        return value.id;
    }

    protected getEvaluation(value: Action): number {
        return 1;
    }
}
