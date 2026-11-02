import express from "express";
import { Express } from "express";
import expressWs from "express-ws";
import { Server } from "http";
import {
    ModulesResolver,
    ModulesResolverProps,
} from "./Module/ModulesResolver";
import { DependencyResolver } from "./Controller/DependencyResolver";
import {
    ConfigService,
    DefaultConfig,
} from "./Providers/Defaults/ConfigService";
import { ConfigurableProp } from "./Types/Configurable";
import { EnvObject } from "./Types/Env";
import { LoggerService, LogLevel } from "./Providers/Defaults/LoggerService";
import { Instance } from "express-ws";
import { Instantiable } from "./Types/Instantiable";
import { Resolver } from "./Resolvers/Resolver";
import cors from "cors";
import { TokenService, TokenServiceConfig } from "./Providers";

export type AppConfig = {
    name: string;
    port: number;
    logLevel?: LogLevel;
    token: TokenServiceConfig;
};

type AppProps<Config extends EnvObject> = {
    appConfig: ConfigurableProp<Config, AppConfig>;
    config?: Config;
    resolvers: Instantiable<Resolver>[];
};

export class App<Config extends EnvObject = DefaultConfig> {
    public app: Express;
    public server: Server | undefined;
    public socket: Instance;

    private readonly configService: ConfigService<Config>;
    private readonly loggerService: LoggerService;
    private readonly tokenService: TokenService;

    constructor(
        private readonly appProps: AppProps<Config> &
            ModulesResolverProps<Config>
    ) {
        this.configService = new ConfigService<Config>(appProps.config);
        this.loggerService = new LoggerService(
            this.configService.getConfigurablePropValue(appProps.appConfig)
                .logLevel
        );
        this.tokenService = new TokenService(
            this.configService.getConfigurablePropValue(appProps.appConfig)
                .token
        );
        this.server = undefined;
        this.app = express();
        this.app.use(express.json());
        this.app.use(
            cors({
                origin: "*",
            })
        );
        this.socket = expressWs(this.app);
        //apply controllers
        const controllers = new DependencyResolver<Config>(
            ModulesResolver.resolve(appProps),
            this.configService,
            this.loggerService,
            this.tokenService
        ).build();
        for (const resolver of appProps.resolvers) {
            new resolver()
                .prepare(controllers, this.loggerService, this.tokenService)
                .apply(this);
        }
    }

    start(): Server {
        const { port, name } = this.configService.getConfigurablePropValue(
            this.appProps.appConfig
        );
        this.server = this.app.listen(port, () => {
            this.loggerService.log(`${name} is ready to talk on port ${port}`);
            this.loggerService.setAppName(name);
            return;
        });
        return this.server;
    }

    stop() {
        this.server?.close();
    }
}
