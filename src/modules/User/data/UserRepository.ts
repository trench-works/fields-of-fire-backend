import { FolderRepository } from "../../../core";
import { User } from "./User";

export class UserRepository extends FolderRepository<User> {
    async entityToRessource(entity: User): Promise<User> {
        return {
            ...entity,
        };
    }

    constructor() {
        super("user", {
            "6fa3bfcb-a15a-4df6-8240-cf26071a34e0": {
                id: "6fa3bfcb-a15a-4df6-8240-cf26071a34e0",
                username: "Développeur",
            },
            "066a86f2-9ee4-4b66-b015-fad3c599aca0": {
                id: "066a86f2-9ee4-4b66-b015-fad3c599aca0",
                username: "Grouldon",
            },
            "44cfc750-4b58-4a8b-9317-1e9378c8f2b0": {
                id: "44cfc750-4b58-4a8b-9317-1e9378c8f2b0",
                username: "Loumbada",
            },
            "1a575e5d-6e61-4042-93c2-d1011225e7a1": {
                id: "1a575e5d-6e61-4042-93c2-d1011225e7a1",
                username: "Moodle",
            },
        });
    }
}
