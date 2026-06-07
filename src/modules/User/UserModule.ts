import { Module } from "../../core";
import { UserController } from "./application/UserController";
import { UserRepository } from "./data/UserRepository";
import { UserService } from "./services/UserService";

export class UserModule extends Module {
    constructor() {
        super({
            controllers: [UserController],
            providers: [UserRepository, UserService],
        });
    }
}
