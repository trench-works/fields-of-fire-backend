import { Evaluation, Evaluator } from "../../../core";
import { Position, PositionUtils } from "../../../game-lib";
import { Action, ActionType, ActionUtils } from "../../Action/data/Action";
import { Entity } from "../../Game/data/Entity";
import { Game } from "../../Game/data/Game";
import { Stats } from "../../Stat/data/Stats";
import { AttackService } from "../services/AttackService";
import { MoveService } from "../services/MoveService";

export type EvaluatedAction = {
    action: Action;
    position: Position;
    targets?: Entity[];
};

export class ActionEvaluator extends Evaluator<Action, EvaluatedAction> {
    constructor(
        protected readonly entity: Entity,
        protected readonly actions: Action[],
        protected readonly game: Game,
        protected readonly attackService: AttackService,
        protected readonly moveService: MoveService
    ) {
        super(actions);
    }

    protected evaluateValue(
        action: Action,
        pushEval: (evaluation: Evaluation<EvaluatedAction>) => void
    ): void {
        if (action.actionType === ActionType.MOUVEMENT) {
            this.evaluateMove(action, pushEval);
        } else {
            this.evaluateAttack(action, pushEval);
        }
    }

    protected evaluateMove(
        action: Action,
        pushEval: (evaluation: Evaluation<EvaluatedAction>) => void
    ) {
        if (this.entity.stats.mouvement > 0) {
            for (const position of this.moveService.getPossibleMove(
                this.entity.position,
                this.game.plateau,
                this.entity.stats.mouvement
            )) {
                this.calculateMoveNote(action, position, pushEval);
            }
        }
    }

    protected calculateMoveNote(
        action: Action,
        position: Position,
        pushEval: (evaluation: Evaluation<EvaluatedAction>) => void
    ): void {
        /**
         * TODO: calculate range from all ennemies and from allies
         * depending on my entity actions, health, ... i'll try to get near ennemis or go far from them
         */
        const moverStats = Stats.fromEntity(this.entity);
        let note = 0;
        for (const entity of this.game.entities) {
            const range = PositionUtils.distance(position, entity.position);
            if (isLowLife(moverStats)) {
                if (isSameTeam(entity, this.entity)) {
                    note += (1 / range) * 5;
                } else {
                    note -= (1 / range) * 10;
                }
            } else {
                if (!isSameTeam(entity, this.entity)) {
                    note += (1 / range) * 2;
                }
            }
        }
        if (note > 0) {
            pushEval({ note, evaluated: { action, position } });
        }
    }

    protected evaluateAttack(
        action: Action,
        pushEval: (evaluation: Evaluation<EvaluatedAction>) => void
    ) {
        if (action.cost > this.entity.stats.energy) {
            return;
        }

        for (const cell of this.attackService.getCellsInAttackRange(
            this.entity.position,
            action,
            this.game.plateau
        )) {
            this.calculateAttackNote(action, cell.position, pushEval);
        }
    }

    protected calculateEffectsNote(
        action: Action,
        target: Entity
    ): { attackerBonus: number; defenserMalus: number } {
        /**
         * TODO: determinate note selon malus et bonus
         */
        return { attackerBonus: 0, defenserMalus: 0 };
    }

    protected calculateAttackNote(
        action: Action,
        position: Position,
        pushEval: (evaluation: Evaluation<EvaluatedAction>) => void
    ): void {
        const attackerStats = Stats.fromEntity(this.entity);
        // get attack targets
        const targets = ActionUtils.getEntitiesInRange(
            action,
            this.game,
            position
        );
        if (!targets?.length) {
            return;
        }

        let note = 0;
        // set note as average expected damage to ennemy divied by action cost minus damage to player itself
        const averageDamage = action.damage
            ? (action.damage.max - action.damage.min) / 2 + action.damage.min
            : 0;
        for (const target of targets) {
            const targetStats = Stats.fromEntity(target);
            const { attackerDamage, defenserDamage } =
                this.attackService.calculateFinalDamage(
                    averageDamage,
                    action,
                    this.entity,
                    target
                );
            const { attackerBonus, defenserMalus } = this.calculateEffectsNote(
                action,
                target
            );
            if (isSameTeam(target, this.entity)) {
                if (isActionHeal(action)) {
                    if (isFullLife(targetStats)) {
                        note = 0;
                    } else {
                        note +=
                            -(defenserDamage / action.cost / 3) -
                            attackerDamage;
                        note +=
                            -(defenserMalus / action.cost / 3) + attackerBonus;
                        if (isLowLife(targetStats)) {
                            note += 5;
                        }
                    }
                } else {
                    note += -(defenserDamage / action.cost) - attackerDamage;
                    note += -(defenserMalus / action.cost) + attackerBonus;
                }
            } else {
                note += defenserDamage / action.cost - attackerDamage;
                note += defenserMalus / action.cost + attackerBonus;
                if (isLowLife(attackerStats)) {
                    note -= 10;
                }
            }
        }
        if (note > 0) {
            pushEval({ note, evaluated: { action, position, targets } });
        }
    }
}

const isActionHeal = (action: Action) => {
    return (action.damage?.min ?? 0) < 0;
};

const isFullLife = (stats: Stats) => {
    return stats.life === stats.maxLife;
};

const isSameTeam = (entityA: Entity, entityB: Entity) => {
    return entityA.teamId === entityB.teamId;
};

const isLowLife = (stats: Stats) => {
    return stats.life < stats.maxLife / 5;
};
