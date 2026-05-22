import { Module } from "../../core";
import { EffectRepository } from "./data/EffectRepository";

export class EffectModule extends Module {
  constructor() {
    super({
      providers: [EffectRepository],
    });
  }
}
