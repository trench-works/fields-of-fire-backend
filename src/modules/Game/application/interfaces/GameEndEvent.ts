import { Boost } from "../../../Effect/data/Boost";

export type GameEndEvent = {
    winnerTeamId: string;
    boosts: Boost[];
};
