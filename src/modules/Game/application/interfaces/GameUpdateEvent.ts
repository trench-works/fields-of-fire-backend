import { AnimatedPayload, GameAnimation } from "../../../../game-lib";
import { Game } from "../../data/Game";

export type GameEventAnimation =
    | GameAnimation<
          "move",
          {
              entityId: string;
              start: { x: number; y: number };
              end: { x: number; y: number };
          }
      >
    | GameAnimation<
          "attack",
          {
              entityId: string;
              actionId: string;
              target: { x: number; y: number };
          }
      >;

export type GameUpdateEvent = AnimatedPayload<Game, GameEventAnimation>;
