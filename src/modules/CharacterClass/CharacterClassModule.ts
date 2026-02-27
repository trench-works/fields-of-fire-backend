import { Module } from "../../core";
import { CharacterClassRepository } from "./data/CharacterClassRepository";



export class CharacterClassModule extends Module {
    constructor() {
        super({ providers: [CharacterClassRepository]})
    }
}