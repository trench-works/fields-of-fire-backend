import { Module } from "../../core";
import { BoostRepository } from "./data/BoostRepository";
import { EffectRepository } from "./data/EffectRepository";

export class EffectModule extends Module {
    constructor() {
        super({
            providers: [EffectRepository, BoostRepository],
        });
    }
}
