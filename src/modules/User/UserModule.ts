import { Module } from "../../core";
import { UserController } from "./application/UserController";
import { UserMasteriesRepository } from "./data/repository/UserMasteriesRepository";
import { UserRepository } from "./data/repository/UserRepository";
import { UserService } from "./services/UserService";

export class UserModule extends Module {
    constructor() {
        super({
            controllers: [UserController],
            providers: [UserRepository, UserService, UserMasteriesRepository],
        });
    }
}
