import { FolderRepository } from "../../../core";
import { User } from "./User";


export class UserRepository extends FolderRepository<User> {
    entityToRessource(entity: User): User {
        return {
            ...entity
        }
    }

    constructor() {
        super("user", {
            "dev": {
                id: "dev",
                username: "Développeur"
            }
        })
    }
}