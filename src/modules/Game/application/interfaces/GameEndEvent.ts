import { Boost } from "../../../Effect/data/Boost";

export type GameEndEvent = {
    playerWin: boolean;
    boosts: Boost[];
};
