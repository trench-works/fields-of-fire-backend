import { FolderRepository } from "../../../core/app/Database/FolderRepository";
import { Effect } from "./Effect";



export class EffectRepository extends FolderRepository<Effect> {
    constructor() {
        super("effects", {})
    }
}