import { PassiveDefinition } from "./data/Passive";
import { enduring } from "./passiveList/Enduring";
import { reflexShot } from "./passiveList/ReflexShot";
import { revengefull } from "./passiveList/Renvegefull";

export const PASSIVES = new Map<string, PassiveDefinition>(
    [enduring, reflexShot, revengefull].map((p) => [p.id, p]),
);