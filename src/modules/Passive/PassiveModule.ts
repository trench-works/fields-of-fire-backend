import { Module } from "../../core";
import { PassiveService } from "./services/PassiveService";

export class PassiveModule extends Module {
  constructor() {
    super({ providers: [PassiveService] });
  }
}
