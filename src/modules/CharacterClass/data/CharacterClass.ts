import { Action } from "../../Action/data/Action";
import { Stats } from "../../Stat/data/Stats";

export class CharacterClass {
  id!: string;
  name!: string;
  imageKey!: string;
  spriteKey!: string;
  iconImageKey!: string;
  stats!: Stats;
  classDescription!: string;
  actionList!: Action[];
}
