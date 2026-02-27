import { AppConfig } from "../core";
import { MongoConnectorProps } from "../core/app/Database/Mongo";
import { RedisConnectorProps } from "../core/app/Database/Redis";
import { LogLevel } from "../core/app/Providers/Defaults/LoggerService";

export type MemoireOublieesConfig = {
    app: AppConfig;
    redis: RedisConnectorProps;
    mongo: MongoConnectorProps;
};

export const ConfigMap: MemoireOublieesConfig = {
    app: {
        name: process.env.APP_NAME ?? "Memoires Oubliees",
        port: Number(process.env.APP_PORT ?? "3000"),
        logLevel: LogLevel.DEBUG,
    },
    redis: {
        host: process.env.REDIS_HOST ?? "localhost",
        port: Number(process.env.REDIS_PORT ?? 6379)
    },
    mongo: {
        host: process.env.MONGO_HOST ?? "localhost",
        port: Number(process.env.MONGO_PORT ?? 27017),
        name: process.env.MONGO_DB_NAME ?? "MemoiresOubliees"
    }
};
