import { Action } from "../../Action/data/Action";
import { Stats } from "../../Stat/data/Stats";

export class CharacterClass {
    id!: string;
    name!: string;
    playable!: boolean;
    stats!: Stats;
    classDescription!: string;
    actionList!: Action[];
    isPlaying!: boolean;
}
