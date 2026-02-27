import { Provider } from "../Controller/DependencyResolver";
import { DefaultConfig } from "../Providers/Defaults/ConfigService";
import { EnvObject } from "../Types/Env";
import { Controllable, Modullable } from "../Types/Instantiable";

type ModulesResolverProps<Config extends EnvObject> = {
    modules?: Modullable<Config>[];
    controllers?: Controllable[];
    providers?: Provider<Config>[];
};

type ResolvedModules<Config extends EnvObject> = {
    controllers: Controllable[];
    providers: Provider<Config>[];
};

export class ModulesResolver {
    static resolve<Config extends EnvObject = DefaultConfig>({
        modules,
        controllers,
        providers,
    }: ModulesResolverProps<Config>): ResolvedModules<Config> {
        const compiledControllers: Controllable[] = controllers ?? [];
        const compiledProviders: Provider<Config>[] =
            providers ?? [];
        if (modules) {
            for (const modullable of modules) {
                const { controllers, providers } = new modullable().config;
                if (controllers) {
                    compiledControllers.push(...controllers);
                }
                if (providers) {
                    compiledProviders.push(...providers);
                }
            }
        }

        return {
            controllers: compiledControllers,
            providers: compiledProviders,
        };
    }
}
