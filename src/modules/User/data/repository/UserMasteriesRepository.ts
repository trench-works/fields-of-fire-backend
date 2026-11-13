import { Provide, PostgresConnector } from "../../../../core";
import { PostgresRepository } from "../../../../core/app/Database/Postgres";
import { UserMasteries } from "../User";
import { UserMasteriesEntity } from "../UserMasteriesEntity";

export class UserMasteriesRepository extends PostgresRepository<UserMasteriesEntity, UserMasteries> {
    entityToRessource(entity: UserMasteriesEntity): UserMasteries {
        return { classId: entity.classId, points: entity.points };
    }

    constructor(@Provide(PostgresConnector) connector: PostgresConnector) {
        super(UserMasteriesEntity, connector);
    }

    async getForUser(userId: string): Promise<UserMasteries[]> {
        const rows = await this.repository.findAll({ where: { userId } });
        return rows.map((r) => this.entityToRessource(r));
    }

    async getPoints(userId: string, classId: string): Promise<number> {
        const row = await this.repository.findOne({ where: { userId, classId } });
        return row?.points ?? DEFAULT_MASTERY_POINTS;
    }

    async setPoints(userId: string, classId: string, points: number): Promise<void> {
        const row = await this.repository.findOne({ where: { userId, classId } });
        if (row) {
            await this.repository.update({ points }, { where: { userId, classId } });
        } else {
            await this.repository.create({ userId, classId, points });
        }
    }
}

export const DEFAULT_MASTERY_POINTS = 10;