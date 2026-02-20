import { Controllable, Instantiable, Modullable } from "../Types/Instantiable";

type ModulesResolverProps = {
    modules?: Modullable[];
    controllers?: Controllable[];
    providers?: Instantiable[];
};

type ResolvedModules = {
    controllers: Controllable[];
    providers: Instantiable[];
};

export class ModulesResolver {
    static resolve({
        modules,
        controllers,
        providers,
    }: ModulesResolverProps): ResolvedModules {
        const compiledControllers: Controllable[] = controllers ?? [];
        const compiledProviders: Instantiable[] = providers ?? [];
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
