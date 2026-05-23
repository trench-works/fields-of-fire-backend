import { Module } from "../../core";
import { MenuController } from "./application/MenuController";
import { MenuWebSocketManager } from "./web/MenuWebSocketManager";

export class MenuModule extends Module {
    constructor() {
        super({
            controllers: [MenuController],
            providers: [MenuWebSocketManager],
        });
    }
}
