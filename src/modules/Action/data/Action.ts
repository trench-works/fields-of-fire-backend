import { Position, PositionUtils } from "../../../game-lib";
import { Effect } from "../../Effect/data/Effect";
import { Entity } from "../../Game/data/Entity";
import { Game } from "../../Game/data/Game";

export enum ActionLevel {
    UNDERGROUND = "UNDERGROUND",
    GROUND = "GROUND",
    OVERGROUND = "OVERGROUND",
}

export class Action {
    id!: string;
    key?: string;
    name!: string;
    description?: string;
    damage?: { min: number; max: number };
    effectList?: Effect[];
    selfEffectList?: Effect[];
    onHitEffectList?: Effect[];
    rangeType!: ActionZoneType;
    range!: { min: number; max: number };
    zoneType!: ActionZoneType[];
    zoneSize!: number;
    actionType!: ActionType;
    //mooveToTarget?: { x: number; y: number };
    maxUsePerTarget?: number;
    maxUsePerRound?: number;
    //pushValue?: number;
    cost!: number;
    //isWalkAction?: boolean;
    targetRequired?: boolean;
    invocateClass?: string;
    level!: ActionLevel;
}

export class ActionEntity {
    id!: string;
    key?: string;
    name!: string;
    description?: string;
    damage?: { min: number; max: number };
    effectList?: string[];
    selfEffectList?: string[];
    onHitEffectList?: string[];
    rangeType!: ActionZoneType;
    range!: { min: number; max: number };
    zoneType!: ActionZoneType[];
    zoneSize!: number;
    actionType!: ActionType;
    //mooveToTarget?: { x: number; y: number };
    maxUsePerTarget?: number;
    maxUsePerRound?: number;
    //pushValue?: number;
    cost!: number;
    //isWalkAction?: boolean;
    targetRequired?: boolean;
    invocateClass?: string;
    level!: ActionLevel;
}

export enum ActionType {
    RANGED = "RANGED",
    MELEE = "MELEE",
    MOUVEMENT = "MOUVEMENT",
    SUPPORT = "SUPPORT",
    OTHER = "OTHER",
}

export enum ActionZoneType {
    DIAMOND = "DIAMOND",
    CIRCLE = "CIRCLE",
    PLUS = "PLUS",
    XCROSS = "XCROSS",
    CONE = "CONE"
}

export class ActionUtils {
    static getEntitiesInRange(
        action: Action,
        game: Game,
        target: Position,
        origin: Position
    ): Entity[] {
        const inBoundsConditions: ((position: Position) => boolean)[] = [];
        for (const zoneType of action.zoneType) {
            switch (zoneType) {
                case ActionZoneType.DIAMOND:
                    inBoundsConditions.push(
                        (position) =>
                            PositionUtils.distance(target, position) <
                            action.zoneSize
                    );
                    break;
                case ActionZoneType.PLUS:
                    inBoundsConditions.push(
                        (position) =>
                            target.x === position.x || target.y === target.y
                    );
                    break;
                case ActionZoneType.XCROSS:
                    inBoundsConditions.push(
                        (position) =>
                            Math.abs(
                                Math.abs(target.x) - Math.abs(position.x)
                            ) ===
                            Math.abs(Math.abs(target.y) - Math.abs(target.y))
                    );
                    break;
                case ActionZoneType.CIRCLE:
                    inBoundsConditions.push(
                        (position) =>
                            PositionUtils.mathDist(target, position) <
                            action.zoneSize
                    );
                    break;
                case ActionZoneType.CONE: {
                    const dx = target.x - origin.x;
                    const dy = target.y - origin.y;

                    // pas de direction (cible sur le lanceur) : le cône ne touche rien
                    if (dx === 0 && dy === 0) {
                        inBoundsConditions.push(() => false);
                        break;
                    }

                    // direction cardinale dominante vers la cible
                    const horizontal = Math.abs(dx) >= Math.abs(dy);
                    const sign = horizontal ? Math.sign(dx) : Math.sign(dy);

                    inBoundsConditions.push((position) => {
                        const depth = horizontal
                            ? (position.x - origin.x) * sign
                            : (position.y - origin.y) * sign;
                        const lateral = horizontal
                            ? Math.abs(position.y - origin.y)
                            : Math.abs(position.x - origin.x);

                        return depth >= 1 && depth <= action.zoneSize && lateral <= depth - 1;
                    });
                    break;
                }
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
                    game.entities.find((entity) => entity.id === cell.entityId)!
                );
            }
        }
        return entities;
    }
}
