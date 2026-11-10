import { Module } from "../../core";
import { MasteryTreeRepository } from "./repository/MasteryTreeRepository";
import { MasteryService } from "./services/MasteryService";
import { MasteryController } from "./application/MasteryController"

export class MasteryModule extends Module {
  constructor() {
    super({ 
      controllers: [MasteryController],
      providers: [MasteryTreeRepository, MasteryService] });
  }
}
