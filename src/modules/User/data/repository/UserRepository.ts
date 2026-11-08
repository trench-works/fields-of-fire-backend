import { ColdRessource, Id, Provide } from "../../../../core";
import {
    PostgresConnector,
    PostgresRepository,
} from "../../../../core/app/Database/Postgres";
import { User } from "../User";
import { UserEntity } from "../UserEntity";
import { UserMasteriesRepository } from "./UserMasteriesRepository";

export class UserRepository
    extends PostgresRepository<UserEntity, User>
    implements ColdRessource<User>
{
    private readonly userMasteriesRepository: UserMasteriesRepository;

    entityToRessource(entity: UserEntity): User {
        return {
            id: entity.id,
            username: entity.username,
        };
    }

    async getWithMasteries(userId: string): Promise<User | undefined> {
        const user = await this.get(userId);
        if (!user) return undefined;
        user.userMasteries = await this.userMasteriesRepository.getForUser(userId);
        return user;
    }

    constructor(
        @Provide(PostgresConnector) connector: PostgresConnector,
        @Provide(UserMasteriesRepository) userMasteriesRepository: UserMasteriesRepository
        
    ) {
        super(UserEntity, connector);
        this.userMasteriesRepository = userMasteriesRepository;
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
