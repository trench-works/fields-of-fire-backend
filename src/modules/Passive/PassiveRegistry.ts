import { PassiveDefinition } from "./data/Passive";
import { enduring } from "./passiveList/Enduring";
import { reflexShot } from "./passiveList/ReflexShot";

export const PASSIVES = new Map<string, PassiveDefinition>(
    [enduring, reflexShot].map((p) => [p.id, p]),
);