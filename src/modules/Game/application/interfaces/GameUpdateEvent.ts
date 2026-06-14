import { AnimatedPayload, GameAnimation } from "../../../../game-lib";
import { Game } from "../../data/Game";

export type GameEventAnimation =
    | GameAnimation<
          "move",
          {
              entityId: string;
          }
      >
    | GameAnimation<
          "attack",
          {
              entityId: string;
              actionId: string;
              target: { x: number; y: number };
          }
      >
    | GameAnimation<
          "death",
          {
              entityId: string;
          }
      >;

export type GameUpdateEvent = AnimatedPayload<Game, GameEventAnimation>;
