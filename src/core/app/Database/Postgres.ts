import {
    AllowNull,
    Column,
    DataType,
    IsUUID,
    Model,
    ModelCtor,
    PrimaryKey,
    Repository,
    Sequelize,
} from "sequelize-typescript";
import { Provide } from "../../decorators";
import { Logger } from "../Providers";
import { Instantiable } from "../Types/Instantiable";
import { ColdRessource } from "./ColdDB";

export class PostgresEntity extends Model {
    @IsUUID(4)
    @PrimaryKey
    @AllowNull(false)
    @Column({ type: DataType.TEXT })
    declare id: string;
}

export type PostgresConnectorProps = {
    host: string;
    port?: number;
    database: string;
    username: string;
    password: string;
};

export class PostgresConnector {
    @Provide("Logger") private readonly logger!: Logger;

    public client!: Sequelize;

    constructor(private readonly props: PostgresConnectorProps) {}

    getClient(models: ModelCtor[]): this {
        this.client = new Sequelize({
            repositoryMode: true,
            host: this.props.host,
            port: this.props.port,
            database: this.props.database,
            username: this.props.username,
            password: this.props.password,
            dialect: "postgres",
            models: models,
            logging: false,
        });
        this.client.sync({ force: false });
        return this;
    }

    async getRepository<Entity extends PostgresEntity>(
        entity: Instantiable<Entity>
    ): Promise<Repository<Entity>> {
        return this.client.getRepository(entity);
    }
}

export abstract class PostgresRepository<
    Entity extends PostgresEntity,
    Domain extends object,
> implements ColdRessource<Domain> {
    abstract entityToRessource(entity: Entity): Domain;

    public readonly sequelize: Sequelize;
    public repository!: Repository<Entity>;

    constructor(entity: Instantiable<Entity>, connector: PostgresConnector) {
        this.sequelize = connector.client;
        connector.getRepository(entity).then((repository) => {
            this.repository = repository;
        });
    }

    async list(): Promise<Domain[]> {
        const users = await this.repository.findAll();
        return users.map((user) => this.entityToRessource(user));
    }

    async get(id: string): Promise<Domain | undefined> {
        const user = await this.repository.findByPk(id);
        if (!user) {
            return undefined;
        }
        return await this.entityToRessource(user.dataValues);
    }
}
