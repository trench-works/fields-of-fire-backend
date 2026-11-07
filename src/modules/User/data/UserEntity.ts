import { AllowNull, Column, DataType, Default, Table } from "sequelize-typescript";
import { PostgresEntity } from "../../../core/app/Database/Postgres";

@Table({ tableName: "users" })
export class UserEntity extends PostgresEntity {
    @AllowNull(false)
    @Column({ type: DataType.TEXT })
    declare username: string;
    @AllowNull(false)
    @Column({ type: DataType.TEXT })
    declare password: string;
    @AllowNull(false)
    @Default(10)
    @Column({ type: DataType.NUMBER })
    //on donne 10 point par défaut à tous les user
    //à changer quant le systeme de level sera fait
    declare masteryPoints: number;
}
