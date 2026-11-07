import { Module } from "../../core";
import { MasteryTreeRepository } from "./repository/MasteryTreeRepository";
import { MasteryService } from "./services/MasteryService";

export class MasteryModule extends Module {
  constructor() {
    super({ providers: [MasteryTreeRepository, MasteryService] });
  }
}
