import { LogLevel } from "../core/app/Providers/Defaults/LoggerService";

export type AppConfig = {
    app: {
        name: string;
        host: string;
        port: number;
        logLevel: LogLevel;
    };
};

export const ConfigMap: AppConfig = {
    app: {
        name: process.env.APP_NAME ?? "Memoires Oubliees",
        host: process.env.HOST ?? "localhost",
        port: Number(process.env.APP_PORT ?? "3000"),
        logLevel: LogLevel.DEBUG,
    },
};
