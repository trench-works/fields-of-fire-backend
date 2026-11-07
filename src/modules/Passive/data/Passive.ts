import { Position } from "../../../game-lib";
import { Action, ManagedEffect } from "../../Action/data/Action";
import { Effect } from "../../Effect/data/Effect";
import { Entity } from "../../Game/data/Entity";
import { Cell, Game } from "../../Game/data/Game";
import { GameEvent, GameEventType } from "./GameEvent";

export type PassiveContext = {
    game: Game;          
    owner: Entity;       
    event: GameEvent;
    baseActions: Action[];
    getCellsInRange: (start: Position, action: Action, board: Cell[][]) => Cell[];
    castFree: (caster: Entity, action: Action, targets: Entity[]) => Promise<void>;
    applyEffects: (caster: Entity, hitTarget: Entity | undefined, effects: ManagedEffect[]) => void;
    getEffect: (id: string) => Promise<Effect | undefined>;
    changeLife: (entity: Entity, delta: number, sourceId?: string) => Promise<void>;
}

export type PassiveDefinition = {
    id: string;
    triggers: GameEventType[];
    reactsToPassive?: boolean;
    run(ctx: PassiveContext): void | Promise<void>;
};