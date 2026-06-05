import { Position, PositionUtils } from "../../../game-lib";
import { Effect } from "../../Effect/data/Effect";
import { Entity } from "../../Game/data/Entity";
import { Game } from "../../Game/data/Game";

export class Action {
    id!: string;
    iconSpriteKey!: string;
    animationSpriteKey?: string;
    animationSpriteConfig?: { frameWidth: number; frameHeight: number };
    key?: string;
    name!: string;
    description?: string;
    damage?: { min: number; max: number };
    effectList?: Effect[];
    range!: number;
    zoneType!: ActionZoneType[];
    zoneSize!: number;
    actionType?: ActionType;
    mooveToTarget?: { x: number; y: number };
    pushValue?: number;
    cost!: number;
    isWalkAction?: boolean;
    targetRequired?: boolean;
}

export enum ActionType {
    RANGED = "ranged",
    MELEE = "melee",
}

export enum ActionZoneType {
    CIRCLE = "circle",
    SQUARE = "square",
    LINE = "line",
    CROSS = "cross",
    X = "x",
}

export class ActionUtils {
    static getEntitiesInRange(
        action: Action,
        game: Game,
        target: Position
    ): Entity[] {
        const inBoundsConditions: ((position: Position) => boolean)[] = [
            (position) =>
                PositionUtils.distance(target, position) <= action.range,
        ];
        for (const zoneType of action.zoneType) {
            switch (zoneType) {
                case ActionZoneType.CROSS:
                    inBoundsConditions.push(
                        (position) =>
                            target.x === position.x || target.y === target.y
                    );
                    break;
            }
        }
        const entities: Entity[] = [];
        for (const cell of game.plateau.flat()) {
            if (
                cell.entityId &&
                inBoundsConditions.every((condition) =>
                    condition(cell.position)
                )
            ) {
                entities.push(
                    game.entities.find(
                        (entity) => entity.entityId === cell.entityId
                    )!
                );
            }
        }
        return entities;
    }
}
