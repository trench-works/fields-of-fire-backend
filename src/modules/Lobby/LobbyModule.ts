import { Module } from "../../core/app/Module";
import { LobbyController } from "./application/LobbyController";

export class LobbyModule extends Module {
    constructor() {
        super({ controllers: [LobbyController], providers: [] });
    }
}
