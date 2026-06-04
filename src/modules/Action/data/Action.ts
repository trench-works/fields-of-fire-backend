import { Effect } from "../../Effect/data/Effect";

export class Action {
  id!: string;
  iconSpriteKey!: string;
  animationSpriteKey?: string;
  animationSpriteConfig?: { frameWidth: number; frameHeight: number };
  key?: string;
  name!: string;
  description?: string;
  damage?: { min: number; max: number };
  effectList?: Effect[];
  range?: number;
  zoneType?: ActionZoneType;
  zoneSize?: number;
  actionType?: ActionType;
  mooveToTarget?: { x: number; y: number };
  pushValue?: number;
  cost!: number;
  isWalkAction?: boolean;
  targetRequired?: boolean ;
}

export enum ActionType {
    RANGED = "ranged",
    MELEE = "melee",
}

export enum ActionZoneType {
  CIRCLE = "circle",
  SQUARE = "square",
  LINE = "line",
  CROSS = "cross",
  x = "x",
}