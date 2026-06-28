import { AnimatedPayload, GameAnimation, Position } from "../../../../game-lib";
import { Game } from "../../data/Game";

export type GameEventAnimation =
    | GameAnimation<
          "move",
          {
              entityId: string;
              path: Position[];
          }
      >
    | GameAnimation<
          "attack",
          {
              entityId: string;
              actionId: string;
              origin: Position;
              target: Position;
              hits: (Position & { damage: number })[];
          }
      >
    | GameAnimation<
          "death",
          {
              entityId: string;
          }
      >;

export type GameUpdateEvent = AnimatedPayload<Game, GameEventAnimation>;
