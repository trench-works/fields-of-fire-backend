import { Table, AllowNull, Column, DataType, Default, ForeignKey } from "sequelize-typescript";
import { PostgresEntity } from "../../../core/app/Database/Postgres";
import { UserEntity } from "./UserEntity";

@Table({ tableName: "user_masteries", underscored: true })
export class UserMasteriesEntity extends PostgresEntity {
    @AllowNull(false)
    @ForeignKey(() => UserEntity)
    @Column({ type: DataType.TEXT})
    declare userId: string;
    @AllowNull(false)
    @Column({ type: DataType.TEXT})
    declare classId: string;
    @AllowNull(false)
    @Default(10)
    @Column({ type: DataType.INTEGER })
    declare points: number;
    //on donne 10 point par défaut à tous les user
    //à changer quant le systeme de level sera fait
}
