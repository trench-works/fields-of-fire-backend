import { PlayerOutputActions } from "../../web/PlayerSocketActions";

export type PlayerCancelAction = {
    actionId: PlayerOutputActions.CANCEL_ACTION;
    payload: {
        reason: "energy" | "mouvement" | "occupied" | "target-visible";
    };
};
