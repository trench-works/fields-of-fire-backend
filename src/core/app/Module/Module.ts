import { DefaultConfig } from "../Providers/Defaults/ConfigService";
import { Configurable } from "../Types/Configurable";
import { EnvObject } from "../Types/Env";
import { Controllable, Instantiable } from "../Types/Instantiable";

type ModuleConfig<Config extends EnvObject> = {
    controllers?: Controllable[];
    providers?: (Instantiable | Configurable<Config>)[];
};

export class Module<Config extends EnvObject = DefaultConfig> {
    constructor(public readonly config: ModuleConfig<Config>) {}
}
