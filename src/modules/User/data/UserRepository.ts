import { FolderRepository } from "../../../core";
import { User } from "./User";


export class UserRepository extends FolderRepository<User> {
    async entityToRessource(entity: User): Promise<User> {
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