import { EvaluationsJoiner } from "../../../core";
import { Action } from "../../Action/data/Action";
import { Entity } from "../../Game/data/Entity";
import { ActionEvaluator } from "./ActionEvaluator";
import { TargetsEvaluator } from "./TargetsEvaluator";

type EvaluatedAction = [Action, Entity];

export class ActionEvaluatorJoiner extends EvaluationsJoiner<EvaluatedAction> {
    constructor(
        protected readonly actionEvaluator: ActionEvaluator,
        protected readonly targetsEvaluator: TargetsEvaluator
    ) {
        super(actionEvaluator, targetsEvaluator);
    }

    getEvaluation([action, entity]: EvaluatedAction) {
        return 1;
    }
}
