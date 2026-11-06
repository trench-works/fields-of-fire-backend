import { Module } from "../../core";
import { PassiveService } from "./services/PassiveService";

export class MasteryModule extends Module {
  constructor() {
    super({ providers: [PassiveService] });
  }
}
