import {
    AppConfig,
    MongoConnectorProps,
    RedisConnectorProps,
    LogLevel,
} from "../core";

export type FieldsOfFireConfig = {
    app: AppConfig;
    redis: RedisConnectorProps;
    mongo: MongoConnectorProps;
};

export const ConfigMap = (): FieldsOfFireConfig => ({
    app: {
        name: process.env.APP_NAME ?? "Fields Of Fire",
        port: Number(process.env.SERVER_PORT ?? 3000),
        logLevel: (process.env.LOG_LEVEL as LogLevel) ?? LogLevel.DEBUG,
    },
    redis: {
        host: process.env.REDIS_HOST ?? "localhost",
        port: Number(process.env.REDIS_PORT ?? 6379),
    },
    mongo: {
        host: process.env.MONGO_HOST ?? "localhost",
        port: Number(process.env.MONGO_PORT ?? 27017),
        name: process.env.MONGO_DB_NAME ?? "FieldsOfFire",
    },
});
