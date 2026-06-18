import { FolderRepository } from "../../../core";
import { Effect, EffectType } from "./Effect";

export class EffectRepository extends FolderRepository<Effect> {
  async entityToRessource(entity: Effect): Promise<Effect> {
    return {
      ...entity,
    };
  }
  constructor() {
    super("effects", {
      amputated : {
        id : "amputated",
        name : "amputé",
        duration : 2,
        type : EffectType.APPLY,
        modifier : 
          {
            life : 0,
            maxLife : 0,
            strength : 0,
            precision : 0,
            armor : 0,
            dodging : 0,
            initiative : 0,
            energy : -1,
            mouvement : 0
          },
      },
      intimidated : {
        id : "intimidated",
        name : "intimidé",
        duration : 3,
        type : EffectType.APPLY,
        modifier : 
          {
            life : 0,
            maxLife : 0,
            strength : -15,
            precision : -15,
            armor : 0,
            dodging : 0,
            initiative : 0,
            energy : 0,
            mouvement : 0
          },
      },
      doped : {
        id : "doped",
        name : "Dopé",
        duration : 3,
        type : EffectType.APPLY,
        modifier : 
          {
            life : 0,
            maxLife : 0,
            strength : 10,
            precision : 10,
            armor : 10,
            dodging : 0,
            initiative : 0,
            energy : 0,
            mouvement : 0
          },
      },
      charge : {
        id : "charge",
        name : "charge",
        duration : 1,
        type : EffectType.APPLY,
        modifier : 
          {
            life : 0,
            maxLife : 0,
            strength : 0,
            precision : 0,
            armor : 0,
            dodging : 0,
            initiative : 0,
            energy : 0,
            mouvement : 2
          },
      },
      enhanced_drug : {
        id : "enhanced_drug",
        name : "Drogue de combat",
        duration : 2,
        type : EffectType.APPLY,
        modifier : 
          {
            life : 0,
            maxLife : 0,
            strength : 10,
            precision : 10,
            armor : 0,
            dodging : 0,
            initiative : 0,
            energy : 2,
            mouvement : 0
          },
      },
      // Boost pour la BoostList
      healUpBoost : {
        id : "healUpBoost",
        name : "Soint total",
        duration : null,
        type : EffectType.APPLY,
        modifier : 
          {
            life : 1000,
            maxLife : 0,
            strength : 0,
            precision : 0,
            armor : 0,
            dodging : 0,
            initiative : 0,
            energy : 0,
            mouvement : 0
          },
      },
      armorBoost : {
        id : "armorBoost",
        name : "Protections améliorées",
        duration : null,
        type : EffectType.APPLY,
        modifier : 
          {
            life : 0,
            maxLife : 0,
            strength : 0,
            precision : 0,
            armor : 10,
            dodging : 0,
            initiative : 0,
            energy : 0,
            mouvement : 0
          },
      },
      versatileBoost : {
        id : "versatileBoost",
        name : "Polyvalence",
        duration : null,
        type : EffectType.APPLY,
        modifier : 
          {
            life : 0,
            maxLife : 0,
            strength : 10,
            precision : 10,
            armor : 0,
            dodging : 0,
            initiative : 0,
            energy : 0,
            mouvement : 0
          },
      },
      strengthBoost : {
        id : "strengthBoost",
        name : "Force Hérculéenne",
        duration : null,
        type : EffectType.APPLY,
        modifier : 
          {
            life : 0,
            maxLife : 0,
            strength : 25,
            precision : 0,
            armor : 0,
            dodging : 0,
            initiative : 0,
            energy : 0,
            mouvement : 0
          },
      },
      precisionBoost : {
        id : "precisionBoost",
        name : "Oeil Affuté",
        duration : null,
        type : EffectType.APPLY,
        modifier : 
          {
            life : 0,
            maxLife : 0,
            strength : 0,
            precision : 25,
            armor : 0,
            dodging : 0,
            initiative : 0,
            energy : 0,
            mouvement : 0
          },
      },
      LifeBoost : {
        id : "lifeBoost",
        name : "Solide Constitution",
        duration : null,
        type : EffectType.APPLY,
        modifier : 
          {
            life : 0,
            maxLife : 10,
            strength : 0,
            precision : 0,
            armor : 0,
            dodging : 0,
            initiative : 0,
            energy : 0,
            mouvement : 0
          },
      },
      VampireBoost : {
        id : "VampireBoost",
        name : "Sanguinaire",
        duration : null,
        type : EffectType.APPLY,
        modifier : 
          {
            life : 0,
            maxLife : 0,
            strength : 0,
            precision : 0,
            armor : 0,
            dodging : 0,
            initiative : 0,
            energy : 0,
            mouvement : 0
          },
      },
      RangeBoost : {
        id : "rangeBoost",
        name : "Tir éloigné",
        duration : null,
        type : EffectType.APPLY,
        modifier : 
          {
            life : 0,
            maxLife : 0,
            strength : 0,
            precision : 0,
            armor : 0,
            dodging : 0,
            initiative : 0,
            energy : 0,
            mouvement : 0
          },
      },
      ReactionBoost : {
        id : "ReactionBoost",
        name : "Adrenaline",
        duration : null,
        type : EffectType.APPLY,
        modifier : 
          {
            life : 5,
            maxLife : 0,
            strength : 3,
            precision : 3,
            armor : 0,
            dodging : 0,
            initiative : 15,
            energy : 0,
            mouvement : 0
          },
      },
      EnergyBoost : {
        id : "EnergyBoost",
        name : "Dopage Energisant",
        duration : null,
        type : EffectType.APPLY,
        modifier : 
          {
            life : 0,
            maxLife : 0,
            strength : 0,
            precision : 0,
            armor : 0,
            dodging : 0,
            initiative : 0,
            energy : 2,
            mouvement : 0
          },
      },
      MouvementBoost : {
        id : "MouvementBoost",
        name : "Accélération",
        duration : null,
        type : EffectType.APPLY,
        modifier : 
          {
            life : 0,
            maxLife : 0,
            strength : 0,
            precision : 0,
            armor : 0,
            dodging : 0,
            initiative : 0,
            energy : 0,
            mouvement : 1
          },
      },
      DodgingBoost : {
        id : "DodgingBoost",
        name : "Jeu de Jambe",
        duration : null,
        type : EffectType.APPLY,
        modifier : 
          {
            life : 0,
            maxLife : 0,
            strength : 0,
            precision : 0,
            armor : 0,
            dodging : 3,
            initiative : 0,
            energy : 0,
            mouvement : 1
          },
      },
    });
  }
}
