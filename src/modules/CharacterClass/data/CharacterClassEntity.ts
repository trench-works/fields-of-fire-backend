import { Stats } from "../../Stat/data/Stats";



export class CharacterClassEntity {
    id!: string;
    name!: string;
    imageKey!: string;
    spriteKey!: string;
    iconImageKey!: string;
    stats!: Stats;
    classDescription!: string;
    actionList!: string[];
}