import { FolderRepository } from "../../../core";
import { Effect } from "./Effect";



export class EffectRepository extends FolderRepository<Effect> {
    async entityToRessource(entity: Effect): Promise<Effect> {
        return {
            ...entity
        }
    }
    constructor() {
        super("effects", {})
    }
}