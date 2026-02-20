import { Module } from "../../core/app/Module/Module";
import { MenuController } from "./application/MenuController";

export class MenuModule extends Module {
    constructor() {
        super({
            controllers: [MenuController],
        });
    }
}
