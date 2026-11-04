import { Boost } from "../../Effect/data/Boost";
import { MasterySelection } from "../../Mastery/data/Mastery";
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
    masteries: MasterySelection
    stats: PlayerStats;
};
