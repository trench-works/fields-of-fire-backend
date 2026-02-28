import { Stats } from "../../Stat/data/Stats";



export class CharacterClassEntity {
    id!: string;
    name!: string;
    stats!: Stats;
    classDescription!: string;
    actionList!: string[];
}