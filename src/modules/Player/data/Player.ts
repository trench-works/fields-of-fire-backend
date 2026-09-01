import { Boost } from "../../Effect/data/Boost";
import { PlayerStats } from "./PlayerStats";

export type Player = {
    id: string;
    userId: string;
    entityId: string;
    gameId: string;
    teamId: string;
    name: string;
    invocations: string[];
    randomBoost: Boost[];
    stats: PlayerStats;
};
