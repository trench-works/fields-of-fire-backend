import { ColdRessource, Id, Provide } from "../../../core";
import {
    PostgresConnector,
    PostgresRepository,
} from "../../../core/app/Database/Postgres";
import { User } from "./User";
import { UserEntity } from "./UserEntity";

export class UserRepository
    extends PostgresRepository<UserEntity, User>
    implements ColdRessource<User>
{
    entityToRessource(entity: UserEntity): User {
        return {
            id: entity.id,
            username: entity.username,
        };
    }

    constructor(
        @Provide(PostgresConnector)
        connector: PostgresConnector
    ) {
        super(UserEntity, connector);
    }

    async save(user: Partial<User>): Promise<User | undefined> {
        user.id ??= Id.get();
        const currentUser = await this.get(user.id);

        if (currentUser) {
            await this.repository.update(user, { where: { id: user.id } });
        } else {
            await this.repository.create(user);
        }

        return await this.get(user.id);
    }
}
