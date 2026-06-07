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
      amputed : {
        name : "amputé",
        duration : 2,
        type : EffectType.APPLY,
        modifier : 
          {
            life : 0,
            strength : 0,
            precision : 0,
            armor : 0,
            dodging : 0,
            initiative : 0,
            energy : -2,
            mouvement : 0
          },
        
      }
    });
  }
}
