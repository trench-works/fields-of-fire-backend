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
}

export type PassiveDefinition = {
    id: string;
    triggers: GameEventType[];
    /** true : le passif réagit aussi aux événements venant d'un autre passif */
    reactsToPassive?: boolean;
    run(ctx: PassiveContext): void | Promise<void>;
};