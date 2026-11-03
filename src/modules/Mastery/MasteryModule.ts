import { Module } from "../../core";
import { MasteryRepository } from "./data/MasteryRepository";

export class MasteryModule extends Module {
  constructor() {
    super({ providers: [MasteryRepository] });
  }
}
