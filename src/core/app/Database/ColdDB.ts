import { Provide } from "../../decorators";
import { DBError } from "./errors/DBError";
import { NoClientError } from "./errors/NoClientError";

export const ColdConnectorProvider = "ColdConnector";

export interface ColdClient {
  close(): Promise<void>;
  get<Ressource extends object = object>(
    key: string,
  ): Promise<Ressource | null>;
  list(): Promise<string[]>;
}

export interface ColdConnector {
  getClient(ressourceName: string): Promise<ColdClient>;
}

export interface ColdRessource<Ressource extends object = object> {
  list(): Promise<Ressource[] | DBError>;
  get(key: string): Promise<Ressource | DBError | null>;
}

export class ColdRepository<
  Ressource extends object = object,
> implements ColdRessource<Ressource> {
  private client: ColdClient | undefined = undefined;

  constructor(private readonly ressourceName: string) {
    this.init = this.init.bind(this);
  }

  public init(@Provide(ColdConnectorProvider) connector: ColdConnector) {
    connector.getClient(this.ressourceName).then((client) => {
      this.client = client;
    });
  }

  public async list(): Promise<Ressource[] | NoClientError> {
    if (!this.client) {
      return new NoClientError();
    }
    return [];
    //return await this.client.list();
  }

  public async get(key: string): Promise<Ressource | NoClientError | null> {
    if (!this.client) {
      return new NoClientError();
    }
    return this.client.get<Ressource>(key);
  }
}
