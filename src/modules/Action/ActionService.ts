import { Action } from "./data/Action";
import { ActionModification, applyModification } from "./data/ActionModifier";

export class ActionService {
    resolveAction(action: Action, modifications: ActionModification[]): Action {
        let result = action;
        for (const mod of modifications) {
            if (mod.id === action.id) {
                result = applyModification(result, mod);
            }
        }
        return result;
    }

    resolveActions(actions: Action[], modifications: ActionModification[]): Action[] {
        return actions.map((a) => this.resolveAction(a, modifications));
    }
}