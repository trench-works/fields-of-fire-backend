import { FolderRepository } from "../../../core";
import { Effect } from "./Effect";



export class EffectRepository extends FolderRepository<Effect> {
    entityToRessource(entity: Effect): Effect {
        return {
            ...entity
        }
    }
    constructor() {
        super("effects", {})
    }
}