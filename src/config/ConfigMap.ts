export type AppConfig = {
    app: {
        host: string;
        port: number;
    };
};

export const ConfigMap: AppConfig = {
    app: {
        host: process.env.HOST ?? "localhost",
        port: Number(process.env.APP_PORT ?? "3000"),
    },
};
