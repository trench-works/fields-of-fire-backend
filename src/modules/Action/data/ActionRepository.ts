import { FolderRepository } from "../../../core";
import { Action } from "./Action";



export class ActionRepository extends FolderRepository<Action> {
    constructor() {
        super("action", {})
    }
}