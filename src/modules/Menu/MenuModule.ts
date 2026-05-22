import { Module } from "../../core";
import { MenuController } from "./application/MenuController";

export class MenuModule extends Module {
  constructor() {
    super({
      controllers: [MenuController],
    });
  }
}
