import { Module } from "../../core";
import { UserRepository } from "./data/UserRepository";

export class UserModule extends Module {
  constructor() {
    super({
      providers: [UserRepository],
    });
  }
}
