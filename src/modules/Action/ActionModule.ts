import { Module } from "../../core";
import { ActionService } from "./ActionService";
import { ActionRepository } from "./data/ActionRepository";

export class ActionModule extends Module {
  constructor() {
    super({ providers: [ActionRepository, ActionService] });
  }
}
