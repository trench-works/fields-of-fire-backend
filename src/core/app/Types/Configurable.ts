import {
    ConfigService,
    DefaultConfig,
} from "../Providers/Defaults/ConfigService";
import { EnvObject } from "./Env";

export type Configurable<Config extends EnvObject = DefaultConfig, T = any> = (
    config: ConfigService<Config>
) => T;

export type ConfigurableProp<
    Config extends EnvObject = DefaultConfig,
    T = any
> = Configurable<Config, T> | T;
