import { Effect } from "../../Effect/data/Effect";

export class Action {
  id!: string;
  iconSpriteKey!: string;
  animationSpriteKey?: string;
  animationSpriteConfig?: { frameWidth: number; frameHeight: number };
  key?: string;
  name!: string;
  description?: string;
  dammage?: number;
  effectList?: Effect[];
  range?: number;
  zoneType?: string;
  zoneSize?: number;
  mooveToTarget?: { x: number; y: number };
  pushValue?: number;
  cost!: number;
  isWalkAction?: boolean;
}
