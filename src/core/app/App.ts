import express from "express";
import { Express } from "express";
import expressWs from "express-ws";
import { Server } from "http";
import { Controllable, Modullable } from "./Types/Instantiable";
import { ModulesResolver } from "./Module/ModulesResolver";
import { TopicResolver } from "./WebSocket/TopicResolver";
import { DependencyResolver, Provider } from "./Controller/DependencyResolver";
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

export type AppConfig = {
    name: string;
    port: number;
    logLevel?: LogLevel;
}

type AppProps<Config extends EnvObject> = {
    controllers?: Controllable[];
    providers?: Provider<Config>[];
    modules?: Modullable<Config>[];
    appConfig: ConfigurableProp<Config, AppConfig>;
    config?: Config;
};

export class App<Config extends EnvObject = DefaultConfig> {
    public app: Express;
    public server: Server | undefined;
    public socket: expressWs.Instance;

    private readonly configService: ConfigService<Config>;
    private readonly loggerService: LoggerService;

    constructor(private readonly appProps: AppProps<Config>) {
        this.configService = new ConfigService<Config>(appProps.config);
        this.loggerService = new LoggerService(
            getConfigurablePropValue(appProps.appConfig, this.configService).logLevel
        );
        this.server = undefined;
        this.app = express();
        this.socket = expressWs(this.app);
        //apply controllers
        const controllers = new DependencyResolver<Config>(
            ModulesResolver.resolve(appProps),
            this.configService,
            this.loggerService
        ).build();
        const topicManagers = new TopicResolver(controllers, this.loggerService).build();
        for (const topicManager of topicManagers) {
            this.socket.app.ws(
                `/${topicManager.topic}`,
                topicManager.open.bind(topicManager)
            );
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
