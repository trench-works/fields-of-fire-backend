import { AppConfig, RedisConnectorProps, LogLevel } from "../core";
import { PostgresConnectorProps } from "../core/app/Database/Postgres";

export type FieldsOfFireConfig = {
    app: AppConfig;
    redis: RedisConnectorProps;
    postgres: PostgresConnectorProps;
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
        password: process.env.POSTGRES_PASSWORD ?? "FieldsOfFire",
    },
    postgres: {
        host: process.env.POSTGRES_HOST ?? "localhost",
        port: Number(process.env.POSTGRES_PORT ?? 5432),
        database: process.env.POSTGRES_DB ?? "FieldsOfFire",
        username: process.env.POSTGRES_USER ?? "FieldsOfFire",
        password: process.env.POSTGRES_PASSWORD ?? "FieldsOfFire",
    },
});
