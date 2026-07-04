import { Provide } from "../../decorators";
import { Logger } from "../Providers";
import { createClient, RedisClientType, RedisDefaultModules } from "redis";

export class RedisRepository<Ressource extends object> {
    constructor(
        private readonly ressourceName: string,
        public readonly connector: RedisConnector
    ) {}

    async set(key: string, value: Ressource): Promise<Ressource | null> {
        const client = this.connector.getClient();
        if (!client) {
            return null;
        }
        await client.set(`${this.ressourceName}:${key}`, JSON.stringify(value));
        return value;
    }

    async list(): Promise<string[]> {
        const client = this.connector.getClient();
        if (!client) {
            return [];
        }
        return await client.keys(`${this.ressourceName}:*`);
    }

    async findAll(): Promise<Ressource[]> {
        const keys = await this.list();

        if (keys.length === 0) return [];

        const values = await Promise.all(
            keys.map((key) => {
                // keys() returns full keys like "user:123", strip the prefix
                const id = key.replace(`${this.ressourceName}:`, "");
                return this.get(id);
            })
        );

        return values.filter((v): v is NonNullable<typeof v> => v !== null);
    }

    async get(key: string): Promise<Ressource | null> {
        const client = this.connector.getClient();
        if (!client) {
            return null;
        }
        const value = await client.get(`${this.ressourceName}:${key}`);
        if (!value) {
            return null;
        }
        return JSON.parse(value);
    }

    async delete(key: string): Promise<boolean> {
        const client = this.connector.getClient();
        if (!client) {
            return false;
        }
        const deleted = await client.del(`${this.ressourceName}:${key}`);
        return deleted === 1;
    }
}

export type RedisConnectorProps = {
    host: string;
    port?: number;
    password?: string;
};

export class RedisConnector {
    @Provide("Logger") private readonly logger!: Logger;

    protected client!: RedisClientType;

    constructor(private readonly props: RedisConnectorProps) {}

    public initClient(): this {
        createClient<RedisDefaultModules, {}, {}, 2, {}>({
            url: `redis://${this.props.host}:${this.props.port ?? 6379}`,
            password: this.props.password,
        })
            .on("error", (err) => this.logger.error(err))
            .connect()
            .then((client) => (this.client = client));
        return this;
    }

    public getClient(): RedisClientType | null {
        return this.client;
    }
}
