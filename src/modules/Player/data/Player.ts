import { Boost } from "../../Effect/data/Boost";

export type Player = {
    id: string;
    userId: string;
    entityId: string;
    gameId: string;
    name: string;
    invocations: string[];
    randomBoost: Boost[];
};
