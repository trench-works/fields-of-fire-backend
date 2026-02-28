import { FolderRepository } from "../../../core";
import { Effect } from "./Effect";



export class EffectRepository extends FolderRepository<Effect> {
    constructor() {
        super("effects", {})
    }
}