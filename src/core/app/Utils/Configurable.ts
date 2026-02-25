import {
    ConfigService,
    DefaultConfig,
} from "../Providers/Defaults/ConfigService";
import { Configurable, ConfigurableProp } from "../Types/Configurable";
import { EnvObject } from "../Types/Env";

function isConfigurable<Config extends EnvObject = DefaultConfig, T = unknown>(
    prop: ConfigurableProp<Config, T>
): prop is Configurable<Config, T> {
    return prop instanceof Function;
}

export function getConfigurablePropValue<
    Config extends EnvObject = DefaultConfig,
    T = unknown
>(prop: ConfigurableProp<Config, T>, configService: ConfigService<Config>): T {
    if (isConfigurable(prop)) {
        return prop(configService);
    } else {
        return prop;
    }
}
