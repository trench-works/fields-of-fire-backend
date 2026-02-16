import { Module } from "../../core";
import { PlayerController } from "./application/PlayerController";

export class PlayerModule extends Module {
    constructor() {
        super({
            controllers: [PlayerController],
        });
    }
}
