import { Position } from "../../../game-lib";

type BaseEvent = {
    /** "player" par défaut ; "passive" si l'événement vient d'un passif (anti-récursion) */
    origin: "player" | "passive";
};

export type GameEvent = BaseEvent &
    (
        | { type: GameEventType.TURN_START; entityId: string }
        | { type: GameEventType.TURN_END; entityId: string }
        | {
              type: GameEventType.ACTION_USED;
              sourceId: string;
              actionId: string;
              targetPosition: Position;
              targetIds: string[];
          }
        | {
              type: GameEventType.DAMAGE_DEALT;
              sourceId: string;        // l'attaquant
              targetId: string;
              actionId: string;
              damage: number;          // dégâts finaux (négatif = soin)
              isCritical: boolean;
          }
        | {
              type: GameEventType.ENTITY_MOVED;
              entityId: string;
              from: Position;
              to: Position;
              cause: "walk" | "push" | "dash";
              movedById?: string;      // qui a provoqué le déplacement (mouvement brutal)
          }
        | { type: GameEventType.ENTITY_DIED; entityId: string; killerId?: string }
        | {
              type: GameEventType.HP_CHANGED;
              entityId: string;
              previous: number;
              current: number;
          }
    );

export enum GameEventType {
    TURN_START = "TURN_START",
    TURN_END = "TURN_END",
    ACTION_USED = "ACTION_USED",
    DAMAGE_DEALT = "DAMAGE_DEALT",
    ENTITY_MOVED = "ENTITY_MOVED",
    ENTITY_DIED = "ENTITY_DIED",
    HP_CHANGED = "HP_CHANGED",
}