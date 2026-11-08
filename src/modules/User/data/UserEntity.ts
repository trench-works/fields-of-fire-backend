import { AllowNull, Column, DataType, Table } from "sequelize-typescript";
import { PostgresEntity } from "../../../core/app/Database/Postgres";

@Table({ tableName: "users" })
export class UserEntity extends PostgresEntity {
    @AllowNull(false)
    @Column({ type: DataType.TEXT })
    declare username: string;
    @AllowNull(false)
    @Column({ type: DataType.TEXT })
    declare password: string;
}
