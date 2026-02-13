import { Controllable, Modullable, Providable } from "../types/Instantiable";

type ModulesResolverProps = {
    modules?: Modullable[];
    controllers?: Controllable[];
    providers?: Providable[];
};

type ResolvedModules = {
    controllers: Controllable[];
    providers: Providable[];
};

export class ModulesResolver {
    static resolve({
        modules,
        controllers,
        providers,
    }: ModulesResolverProps): ResolvedModules {
        const compiledControllers: Controllable[] = controllers ?? [];
        const compiledProviders: Providable[] = providers ?? [];
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
