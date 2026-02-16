import { Controller } from "../../../core";

export class PlayerController extends Controller {
    constructor() {
        super({ topic: "players" });
    }
}
