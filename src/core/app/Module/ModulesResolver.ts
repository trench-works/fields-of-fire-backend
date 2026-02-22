import { DefaultConfig } from "../Providers/Defaults/ConfigService";
import { Configurable } from "../Types/Configurable";
import { EnvObject } from "../Types/Env";
import { Controllable, Instantiable, Modullable } from "../Types/Instantiable";

type ModulesResolverProps<Config extends EnvObject> = {
    modules?: Modullable<Config>[];
    controllers?: Controllable[];
    providers?: (Instantiable | Configurable<Config>)[];
};

type ResolvedModules<Config extends EnvObject> = {
    controllers: Controllable[];
    providers: (Instantiable | Configurable<Config>)[];
};

export class ModulesResolver {
    static resolve<Config extends EnvObject = DefaultConfig>({
        modules,
        controllers,
        providers,
    }: ModulesResolverProps<Config>): ResolvedModules<Config> {
        const compiledControllers: Controllable[] = controllers ?? [];
        const compiledProviders: (Instantiable | Configurable<Config>)[] =
            providers ?? [];
        if (modules) {
            for (const modullable of modules) {
                const { controllers, providers } = new modullable().config;
                controllers && compiledControllers.push(...controllers);
                providers && compiledProviders.push(...providers);
            }
        }

        return {
            controllers: compiledControllers,
            providers: compiledProviders,
        };
    }
}
