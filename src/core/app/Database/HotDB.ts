import { Provide } from "../../decorators";
import { NoClientError } from "./errors/NoClientError";

export const HotConnectorProvider = "HotConnector"

export interface HotClient {
    close(): Promise<void>;
    set<Ressource extends object = object>(key: string, value : Ressource): Promise<Ressource>;
    get<Ressource extends object = object>(key: string): Promise<Ressource | null>;
    list(): Promise<string[]>;
}

export interface HotConnector {
    getClient(ressourceName: string): Promise<HotClient>
}

export class HotRessource<Ressource extends object = object> {
    private client: HotClient | undefined = undefined;

    constructor(private readonly ressourceName: string) {
        this.init = this.init.bind(this);
    }
    
    public init(@Provide(HotConnectorProvider) connector: HotConnector) {
        connector.getClient(this.ressourceName).then((client) => {
            this.client = client;
        });
    }
    
    public async list(): Promise<string[] | NoClientError> {
        if (!this.client) {
            return new NoClientError();
        }
        return this.client.list();
    }

    public async set(key: string, value: Ressource): Promise<Ressource | NoClientError> {
        if (!this.client) {
            return new NoClientError();
        }
        return this.client.set<Ressource>(key, value);
    }

    public async get(key: string): Promise<Ressource | NoClientError | null> {
                if (!this.client) {
            return new NoClientError();
        }
        return this.client.get<Ressource>(key)
    }
}