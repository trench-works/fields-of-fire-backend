import { Evaluation, Evaluator, MyMath, MyObject } from "../../../core";
import { Position, PositionUtils } from "../../../game-lib";
import { ActionType } from "../../Action/data/Action";
import { CharacterClass } from "../../CharacterClass/data/CharacterClass";
import { CharacterClassRepository } from "../../CharacterClass/data/CharacterClassRepository";
import { CellAStar, Game } from "../../Game/data/Game";
import { AttackService } from "../services/AttackService";
import { MoveService } from "../services/MoveService";
import { ActionEvaluator, EvaluatedAction } from "./ActionEvaluator";

type ActionSuiteStep = Evaluation<EvaluatedAction> & {
    game: Game;
};

type ActionBranch = ActionSuiteStep & { branches?: ActionBranch[] };

type ActionTree = ActionBranch[];

class ActionSuiteEvaluator extends Evaluator<
    ActionSuiteStep[],
    EvaluatedAction[]
> {
    protected async evaluateValue(
        value: ActionSuiteStep[],
        pushEvaluation: (evaluation: Evaluation<EvaluatedAction[]>) => void
    ): Promise<void> {
        pushEvaluation({
            note: MyMath.sum(value.map((step) => step.note)),
            evaluated: value.map((step) => step.evaluated),
        });
    }
}

export class ActionSuiteCalculator {
    constructor(
        private readonly classRepository: CharacterClassRepository,
        private readonly attackService: AttackService,
        private readonly moveService: MoveService
    ) {}

    private applyAction(
        action: EvaluatedAction,
        game: Game,
        entityId: string
    ): Game {
        const myGame = MyObject.deepClone(game);
        const entity = myGame.entities.find(
            (entity) => entity.id === entityId
        )!;
        if (
            action.action.actionType === ActionType.MOUVEMENT &&
            !PositionUtils.equal(entity.position, action.position)
        ) {
            const moves = new CellAStar().findPath(
                entity.position,
                action.position,
                myGame.plateau
            );
            const movePath: Position[] = [{ ...entity.position }];
            while (entity.stats.mouvement > 0 && moves.length > 0) {
                myGame.plateau[entity.position.x][entity.position.y].entityId =
                    undefined;
                entity.position = PositionUtils.add(entity.position, moves[0]);
                movePath.push({ ...entity.position });
                myGame.plateau[entity.position.x][entity.position.y].entityId =
                    entity.id;
                entity.stats.mouvement--;
                moves.shift();
            }
        } else {
            entity.stats.energy -= action.action.cost;
            const hits: (Position & {
                damage: number;
            })[] = [];
            if (action?.targets) {
                for (const target of action?.targets ?? []) {
                    const damage = this.attackService.applyDamage(
                        myGame,
                        action.action,
                        entity,
                        target
                    );
                    hits.push({ ...action.position, damage });
                }
            }
        }
        return myGame;
    }

    private async getNextSteps(
        game: Game,
        charClass: CharacterClass
    ): Promise<ActionSuiteStep[] | undefined> {
        const entity = game.entities.find(
            (entity) => entity.id === game.playerTurns[0]
        )!;
        const evaluator = await new ActionEvaluator(
            entity,
            charClass.actionList,
            game,
            this.attackService,
            this.moveService
        ).evaluate();
        const evaluations = evaluator.getPositives();
        if (!evaluations.length) {
            return undefined;
        }
        return evaluations.map((evaluation) => ({
            ...evaluation,
            game: this.applyAction(evaluation.evaluated, game, entity.id),
        }));
    }

    private compressActions(
        actions: EvaluatedAction[] | null
    ): EvaluatedAction[] | null {
        if (!actions?.length) {
            return null;
        }
        const compressedActions: EvaluatedAction[] = [];
        for (const action of actions) {
            const latestAction = compressedActions.at(-1);
            if (
                !latestAction ||
                !(
                    latestAction.action.actionType === ActionType.MOUVEMENT &&
                    action.action.actionType === ActionType.MOUVEMENT
                )
            ) {
                compressedActions.push(action);
                continue;
            }
            latestAction.position = action.position;
        }
        return actions;
    }

    private async getBranches(
        branch: ActionBranch,
        charClass: CharacterClass,
        depth = 0
    ): Promise<ActionBranch> {
        console.log(new Date().toISOString() + " DEPTH : " + depth);
        const nextSteps = await this.getNextSteps(branch.game, charClass);
        if (nextSteps) {
            branch.branches = await Promise.all(
                nextSteps.map(async (step) =>
                    this.getBranches(step, charClass, depth + 1)
                )
            );
        }
        return branch;
    }

    private async getActionsTree(
        game: Game,
        charClass: CharacterClass
    ): Promise<ActionTree> {
        const nextSteps = await this.getNextSteps(game, charClass);
        if (!nextSteps) {
            return [];
        }
        return await Promise.all(
            nextSteps.map(async (step) => this.getBranches(step, charClass))
        );
    }

    private unnestTree(
        tree: ActionTree,
        root: ActionSuiteStep[] = []
    ): ActionSuiteStep[][] {
        return tree.flatMap(({ branches, ...step }) => {
            const path = MyObject.deepClone([...root, step]);
            return branches?.length ? this.unnestTree(branches, path) : [path];
        });
    }

    async generate(game: Game): Promise<EvaluatedAction[] | undefined> {
        const entity = game.entities.find(
            (entity) => entity.id === game.playerTurns[0]
        )!;
        const charClass = await this.classRepository.get(entity.classId);
        if (!charClass) {
            return;
        }

        const tree = await this.getActionsTree(game, charClass);
        if (!tree.length) {
            return undefined;
        }

        const unnested = this.unnestTree(tree);

        const evaluator = await new ActionSuiteEvaluator(unnested).evaluate();

        return this.compressActions(evaluator.getBest()) ?? undefined;
    }
}
