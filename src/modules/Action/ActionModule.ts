import { Module } from "../../core";
import { ActionRepository } from "./data/ActionRepository";


export class ActionModule extends Module {
    constructor() {
        super({providers: [ActionRepository]})
    }
}