import { Provide } from "../../decorators";
import { Logger } from "../Providers";
import { HotClient, HotConnector } from "./HotDB";
import { createClient, RedisClientType, RedisDefaultModules } from "redis";

export class RedisClient implements HotClient {
  constructor(
    private readonly ressourceName: string,
    private readonly client: RedisClientType,
  ) {}

  async set<Ressource extends object = object>(
    key: string,
    value: Ressource,
  ): Promise<Ressource> {
    this.client.set(`${this.ressourceName}:${key}`, JSON.stringify(value));
    return value;
  }

  async list(): Promise<string[]> {
    return await this.client.keys(`${this.ressourceName}:*`);
  }

  async get<Ressource extends object = object>(
    key: string,
  ): Promise<Ressource | null> {
    const value = await this.client.get(`${this.ressourceName}:${key}`);
    if (!value) {
      return null;
    }
    return JSON.parse(value);
  }

  async close(): Promise<void> {
    this.client.destroy();
  }
}

export type RedisConnectorProps = {
  host: string;
  port?: number;
};

export class RedisConnector implements HotConnector {
  @Provide("Logger") private readonly logger!: Logger;

  constructor(private readonly props: RedisConnectorProps) {}

  async getClient(ressourceName: string): Promise<RedisClient> {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    const redisClient: RedisClientType = await createClient<
      RedisDefaultModules,
      {},
      {},
      2,
      {}
    >({
      url: `redis://${this.props.host}:${this.props.port ?? 6379}`,
    })
      .on("error", (err) => this.logger.error(err))
      .connect();
    return new RedisClient(ressourceName, redisClient);
  }
}
