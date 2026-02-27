import { AppConfig } from "../core";
import { RedisConnectorProps } from "../core/app/Database/RedisClient";
import { LogLevel } from "../core/app/Providers/Defaults/LoggerService";

export type MemoireOublieesConfig = {
    app: AppConfig;
    redis: RedisConnectorProps
};

export const ConfigMap: MemoireOublieesConfig = {
    app: {
        name: process.env.APP_NAME ?? "Memoires Oubliees",
        port: Number(process.env.APP_PORT ?? "3000"),
        logLevel: LogLevel.DEBUG,
    },
    redis: {
        host: process.env.DATABASE_HOST ?? "localhost",
        port: Number(process.env.DATABASE_PORT ?? 6379)
    }
};
