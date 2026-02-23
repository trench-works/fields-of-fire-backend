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
    Logger,
    LoggerService,
    LogLevel,
} from "./Providers/Defaults/LoggerService";

type AppProps<Config extends EnvObject> = {
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
    private readonly loggerService: Logger;

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
            { logLevel: appProps.logLevel },
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
        this.server = this.app.listen(port, () => {
            return this.loggerService.log(
                `SocketAPI is ready to talk on port ${port}`
            );
        });
        return this.server;
    }

    stop() {
        this.server?.close();
    }
}
