import { Provider } from "../Controller/DependencyResolver";
import { DefaultConfig } from "../Providers/Defaults/ConfigService";
import { EnvObject } from "../Types/Env";
import { Controllable } from "../Types/Instantiable";

type ModuleConfig<Config extends EnvObject> = {
    controllers?: Controllable[];
    providers?: Provider<Config>[];
};

export class Module<Config extends EnvObject = DefaultConfig> {
    constructor(public readonly config: ModuleConfig<Config>) {}
}
