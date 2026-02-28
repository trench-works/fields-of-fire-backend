import express from "express";
import { Express } from "express";
import expressWs from "express-ws";
import { Server } from "http";
import { ModulesResolver, ModulesResolverProps } from "./Module/ModulesResolver";
import { DependencyResolver } from "./Controller/DependencyResolver";
import {
    ConfigService,
    DefaultConfig,
} from "./Providers/Defaults/ConfigService";
import { ConfigurableProp } from "./Types/Configurable";
import { EnvObject } from "./Types/Env";
import { getConfigurablePropValue } from "./Utils/Configurable";
import {
    LoggerService,
    LogLevel,
} from "./Providers/Defaults/LoggerService";
import {Instance} from "express-ws"
import { Instantiable } from "./Types/Instantiable";
import { Resolver } from "./Resolvers/Resolver";

export type AppConfig = {
    name: string;
    port: number;
    logLevel?: LogLevel;
}

type AppProps<Config extends EnvObject> = {
    appConfig: ConfigurableProp<Config, AppConfig>;
    config?: Config;
    resolvers: Instantiable<Resolver>[]
};

export class App<Config extends EnvObject = DefaultConfig> {
    public app: Express;
    public server: Server | undefined;
    public socket: Instance;

    private readonly configService: ConfigService<Config>;
    private readonly loggerService: LoggerService;

    constructor(private readonly appProps: AppProps<Config> & ModulesResolverProps<Config>) {
        this.configService = new ConfigService<Config>(appProps.config);
        this.loggerService = new LoggerService(
            getConfigurablePropValue(appProps.appConfig, this.configService).logLevel
        );
        this.server = undefined;
        this.app = express();
        this.app.use(express.json());
        this.socket = expressWs(this.app);
        //apply controllers
        const controllers = new DependencyResolver<Config>(
            ModulesResolver.resolve(appProps),
            this.configService,
            this.loggerService
        ).build();
        for (const resolver of appProps.resolvers) {
            new resolver().prepare(controllers, this.loggerService).apply(this);
        }
    }

    start(): Server {
        const {port, name} = getConfigurablePropValue(
            this.appProps.appConfig,
            this.configService
        );
        this.server = this.app.listen(port, () => {
            this.loggerService.log(
                `${name} is ready to talk on port ${port}`
            );
            this.loggerService.setAppName(name);
            return;
        });
        return this.server;
    }

    stop() {
        this.server?.close();
    }
}
