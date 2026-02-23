import { LogLevel } from "../core/app/Providers/Defaults/LoggerService";

export type AppConfig = {
    app: {
        host: string;
        port: number;
        logLevel: LogLevel;
    };
};

export const ConfigMap: AppConfig = {
    app: {
        host: process.env.HOST ?? "localhost",
        port: Number(process.env.APP_PORT ?? "3000"),
        logLevel: LogLevel.DEBUG,
    },
};
