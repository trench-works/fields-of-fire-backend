import { Configurable, ConfigurableProp } from "../../Types/Configurable";
import { EnvObject } from "../../Types/Env";

export type DefaultConfig = {
    app: {
        port: number;
    };
};

export const DefaultConfigValues = {
    app: {
        port: Number(process.env.APP_PORT),
    },
};

function isConfigurable<Config extends EnvObject = DefaultConfig, T = unknown>(
    prop: ConfigurableProp<Config, T>
): prop is Configurable<Config, T> {
    return prop instanceof Function;
}

export class ConfigService<Config extends EnvObject = DefaultConfig> {
    constructor(
        private readonly env: Config = DefaultConfigValues as unknown as Config
    ) {}

    getConfigurablePropValue<T = unknown>(
        prop: ConfigurableProp<Config, T>
    ): T {
        if (isConfigurable(prop)) {
            return prop(this);
        } else {
            return prop;
        }
    }

    getConfig() {
        return this.env;
    }
}
