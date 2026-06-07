import { Provide } from "../../decorators";
import { Logger } from "../Providers";
import { ColdClient, ColdConnector } from "./ColdDB";

import {
    MongoClient as BaseMongoClient,
    Db,
    Document as MondoDoc,
} from "mongodb";

export class MongoClient implements ColdClient {
    constructor(
        private readonly ressourceName: string,
        private readonly client: Db
    ) {}

    async list(): Promise<string[]> {
        return Array.from(
            (
                await this.client
                    .collection(this.ressourceName)
                    .find({})
                    .toArray()
            ).keys()
        ).map(String);
    }

    async get<Ressource extends MondoDoc>(
        key: string
    ): Promise<Ressource | undefined> {
        return (
            ((
                await this.client
                    .collection<Ressource>(this.ressourceName)
                    .find({})
                    .toArray()
            )[0] as Ressource) ?? undefined
        );
    }

    async close(): Promise<void> {}
}

export type MongoConnectorProps = {
    host: string;
    port?: number;
    name: string;
};

export class MongoConnector implements ColdConnector {
    @Provide("Logger") private readonly logger!: Logger;

    constructor(private readonly props: MongoConnectorProps) {}

    async getClient(ressourceName: string): Promise<MongoClient> {
        const url = `mongodb://${this.props.host}:${this.props.port}`;
        const client = new BaseMongoClient(url).db(this.props.name);
        return new MongoClient(ressourceName, client);
    }
}
