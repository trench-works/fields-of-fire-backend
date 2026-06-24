import { FolderRepository } from "../../../core";
import { Boost } from "./Boost";

export class BoostRepository extends FolderRepository<Boost> {
    async entityToRessource(entity: Boost): Promise<Boost> {
        return {
            ...entity,
        };
    }
    constructor() {
        super("boosts");
    }
}
