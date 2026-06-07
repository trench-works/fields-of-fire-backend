import { Module } from "../../core";
import { CharacterClassController } from "./application/CharacterClassController";
import { CharacterClassRepository } from "./data/CharacterClassRepository";

export class CharacterClassModule extends Module {
  constructor() {
    super({
      controllers: [CharacterClassController],
      providers: [CharacterClassRepository],
    });
  }
}
