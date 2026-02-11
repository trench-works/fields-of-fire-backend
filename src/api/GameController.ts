import { Controller } from "../core/app/Controller";

export class GameController extends Controller {
    constructor() {
        super({ path: "/games" });
        //create subscriptions for this controller
        this.on((message: string) => console.log(message));
    }
}
