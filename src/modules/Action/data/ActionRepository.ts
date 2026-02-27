import { FolderRepository } from "../../../core/app/Database/FolderRepository";
import { Action } from "./Action";



export class ActionRepository extends FolderRepository<Action> {
    constructor() {
        super("action", {})
    }
}