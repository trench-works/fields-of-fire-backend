import { FolderRepository } from "../../../core";
import { User } from "./User";


export class UserRepository extends FolderRepository<User> {
    constructor() {
        super("user", {
            "dev": {
                id: "dev",
                username: "Développeur"
            }
        })
    }
}