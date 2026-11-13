import { PassiveDefinition } from "./data/Passive";
import { bloodthirsty } from "./passiveList/BloodThristy";
import { emergencyDeployment } from "./passiveList/EmergencyDeployment";
import { emergencyDose } from "./passiveList/EmergencyDose";
import { enduring } from "./passiveList/Enduring";
import { reflexShot } from "./passiveList/ReflexShot";
import { revengefull } from "./passiveList/Renvegefull";

export const PASSIVES = new Map<string, PassiveDefinition>(
    [
        //fantassin
        enduring, reflexShot, revengefull, 
        //medic
        bloodthirsty,emergencyDose, emergencyDeployment,
        //caporal
        //brise-barricade
    ].map((p) => [p.id, p]),
);