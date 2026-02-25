import express from "express";
import { Express } from "express";
import expressWs from "express-ws";
import { Server } from "http";
import { Controllable, Instantiable, Modullable } from "./Types/Instantiable";
import { ModulesResolver } from "./Module/ModulesResolver";
import { TopicResolver } from "./WebSocket/TopicResolver";
import { DependencyResolver } from "./Controller/DependencyResolver";
import {
    ConfigService,
    DefaultConfig,
} from "./Providers/Defaults/ConfigService";
import { Configurable, ConfigurableProp } from "./Types/Configurable";
import { EnvObject } from "./Types/Env";
import { getConfigurablePropValue } from "./Utils/Configurable";
import {
    LoggerService,
    LogLevel,
} from "./Providers/Defaults/LoggerService";

type AppProps<Config extends EnvObject> = {
    appName: ConfigurableProp<Config, string>;
    port: ConfigurableProp<Config, number>;
    logLevel?: ConfigurableProp<Config, LogLevel>;
    controllers?: Controllable[];
    providers?: (Instantiable | Configurable<Config>)[];
    modules?: Modullable<Config>[];
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
            getConfigurablePropValue(appProps.logLevel, this.configService)
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
        const topicManagers = new TopicResolver(controllers).build();
        for (const topicManager of topicManagers) {
            this.socket.app.ws(
                `/${topicManager.topic}`,
                topicManager.open.bind(topicManager)
            );
        }
    }

    start(): Server {
        const port = getConfigurablePropValue(
            this.appProps.port,
            this.configService
        );
        const appName = getConfigurablePropValue(
            this.appProps.appName,
            this.configService
        );
        this.server = this.app.listen(port, () => {
            this.loggerService.log(
                `${appName} is ready to talk on port ${port}`
            );
            this.loggerService.setAppName(appName);
            return;
        });
        return this.server;
    }

    stop() {
        this.server?.close();
    }
}
