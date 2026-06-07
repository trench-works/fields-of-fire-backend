import "reflect-metadata";
import { Controllable, Instantiable } from "../Types/Instantiable";
import { WsController } from "..";
import { Configurable } from "../Types/Configurable";
import {
    ConfigService,
    DefaultConfig,
} from "../Providers/Defaults/ConfigService";
import { EnvObject } from "../Types/Env";
import { Logger } from "../Providers/Defaults/LoggerService";

export interface AsyncDependencyResolver {
    getProvider<Provider extends object>(
        providable: Instantiable | string
    ): Provider;
}

type ResolvedProvider = object & Partial<AsyncDependencyResolver>;

export interface AsyncResolver {
    asyncResolve(resolver: AsyncDependencyResolver): void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isInstantiable = <T = any>(
    obj: string | Instantiable<T>
): obj is Instantiable<T> => {
    return typeof obj !== "string";
};

function isInstantiableOrConfigurable<
    Config extends EnvObject = DefaultConfig,
    T = unknown,
>(obj: Configurable<Config, T> | Instantiable<T>): obj is Instantiable<T> {
    const isCtorClass =
        obj.constructor &&
        obj.constructor.toString().substring(0, 5) === "class";
    if (obj.prototype === undefined) {
        return isCtorClass;
    }
    const isPrototypeCtorClass =
        obj.prototype.constructor &&
        obj.prototype.constructor.toString &&
        obj.prototype.constructor.toString().substring(0, 5) === "class";
    return isCtorClass || isPrototypeCtorClass;
}

type BaseProvider<Config extends EnvObject> =
    | Instantiable
    | Configurable<Config>;
type ComplexProvider<Config extends EnvObject> = {
    name: string | BaseProvider<Config>;
    provider: BaseProvider<Config>;
};

export type Provider<Config extends EnvObject> =
    | BaseProvider<Config>
    | ComplexProvider<Config>;

function isBaseProvider<Config extends EnvObject>(
    provider: Provider<Config>
): provider is BaseProvider<Config> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (provider as any)["prototype"];
}

type DependencyResolverOptions<Config extends EnvObject> = {
    controllers: Controllable[];
    providers: Provider<Config>[];
};

export class DependencyResolver<
    Config extends EnvObject,
> implements AsyncDependencyResolver {
    private readonly providerClassesMap = new Map<
        string,
        BaseProvider<Config>
    >();
    private readonly providersDependenciesMap = new Map<string, string[]>();

    private readonly controllerClasses: Controllable[];

    private readonly resolvedProviders = new Map<string, ResolvedProvider>();

    public getProvider<Provider extends object>(
        providable: Instantiable | string
    ): Provider {
        const providerName = isInstantiable(providable)
            ? providable.name
            : providable;
        return this.resolvedProviders.get(providerName) as Provider;
    }

    constructor(
        { controllers, providers }: DependencyResolverOptions<Config>,
        private readonly configService: ConfigService<Config>,
        private readonly logger: Logger
    ) {
        this.resolvedProviders.set("ConfigService", this.configService);
        this.resolvedProviders.set("Logger", logger);
        this.logger.debug("Building dependencies tree...");
        this.controllerClasses = controllers;
        for (const provider of providers) {
            // decode complex providers
            let name: string;
            let baseProvider: BaseProvider<Config>;
            if (isBaseProvider(provider)) {
                name = provider.name;
                baseProvider = provider;
            } else if (typeof provider.name === "string") {
                name = provider.name;
                baseProvider = provider.provider;
            } else {
                name = provider.name.name;
                baseProvider = provider.provider;
            }
            // prepare maps for resolution
            this.providerClassesMap.set(name, baseProvider);
            const dependencies: string[] = [];
            for (const mdKey of Reflect.getMetadataKeys(baseProvider).sort(
                (kA, kB) => (kA < kB ? -1 : 1)
            )) {
                dependencies.push(Reflect.getMetadata(mdKey, baseProvider));
            }
            this.providersDependenciesMap.set(name, dependencies);
        }
        this.logger.debug("Dependencies tree ready for compiling !");
    }

    private instantiate<ToInstantiate extends object = object | WsController>(
        instantiator:
            | Instantiable<ToInstantiate>
            | Configurable<Config, ToInstantiate>,
        dependenciesNames: string[]
    ): ToInstantiate {
        const dependencies: object[] = [];
        for (const dependencyName of dependenciesNames) {
            const dep = this.getProvider(dependencyName);
            if (dep) {
                dependencies.push(dep);
            }
        }
        if (isInstantiableOrConfigurable(instantiator)) {
            return new instantiator(...dependencies);
        } else {
            return instantiator(this.configService);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private resolvePropertyDependencies(provider: any) {
        for (const property of Object.keys(provider)) {
            const keys = Reflect.getMetadataKeys(provider, property);
            if (typeof provider[property] === "function") {
                const providers = [];
                for (const key of keys.sort((kA, kB) => (kA < kB ? -1 : 1))) {
                    const [type, propName, index] = key.split("-");
                    if (
                        index !== undefined &&
                        type === "provider" &&
                        property === propName
                    ) {
                        const providerName: string = Reflect.getMetadata(
                            key,
                            provider,
                            property
                        );
                        if (this.resolvedProviders.has(providerName)) {
                            providers.push(this.getProvider(providerName));
                        } else {
                            this.logger.error(
                                `Provider ${providerName} doesn't exist for property ${property} of element ${JSON.stringify(provider)}`
                            );
                        }
                    }
                }
                provider[property](...providers);
                return;
            }
            for (const key of keys) {
                const [type, propName, index] = key.split("-");
                if (!index) {
                    if (type === "provider" && property === propName) {
                        const providerName: string = Reflect.getMetadata(
                            key,
                            provider,
                            property
                        );
                        if (this.resolvedProviders.has(providerName)) {
                            provider[property] = this.getProvider(providerName);
                        } else {
                            this.logger.error(
                                `Provider ${providerName} doesn't exist for property ${property} of element ${JSON.stringify(provider)}`
                            );
                        }
                    }
                }
            }
        }
    }

    build(): object[] {
        this.logger.debug("Dependency tree compiling...");
        // Providers Synchrone Resolving
        while (this.providersDependenciesMap.size > 0) {
            const providersSize = this.providersDependenciesMap.size;
            const orderedProviders = Array.from(
                this.providersDependenciesMap.entries()
            ).sort(([, depA], [, depB]) => depA.length - depB.length);
            for (const [
                providerName,
                providerDependencies,
            ] of orderedProviders) {
                let fullyResolved = true;
                for (const dependency of providerDependencies) {
                    if (!this.resolvedProviders.has(dependency)) {
                        fullyResolved = false;
                    }
                }
                if (fullyResolved) {
                    const instantiator =
                        this.providerClassesMap.get(providerName);

                    if (instantiator) {
                        this.resolvedProviders.set(
                            providerName,
                            this.instantiate(instantiator, providerDependencies)
                        );
                    }
                    this.providersDependenciesMap.delete(providerName);
                }
            }
            if (providersSize === this.providersDependenciesMap.size) {
                throw new Error("RECURSIVE_DEPENDENCY", {
                    cause: "No dependency resolved during round of dependency resolving",
                });
            }
        }

        //Providers Async Resolving
        for (const provider of this.resolvedProviders.values()) {
            this.resolvePropertyDependencies(provider);
            (provider as AsyncResolver).asyncResolve?.(this);
        }

        // Controllers Synchrone Resolving
        const resolvedControllers: object[] = this.controllerClasses.map(
            (controllerClass) => {
                const dependencies = Reflect.getMetadataKeys(controllerClass)
                    .filter((key) =>
                        String(key).startsWith("provider-constructor")
                    )
                    .map((key) => Number(String(key).split("-")[2]))
                    .sort((a, b) => a - b)
                    .map((mdKeyId) =>
                        Reflect.getMetadata(
                            `provider-constructor-${mdKeyId}`,
                            controllerClass
                        )
                    );
                return this.instantiate(controllerClass, dependencies);
            }
        );
        for (const controller of resolvedControllers) {
            this.resolvePropertyDependencies(controller);
        }

        this.logger.debug("Dependencies are fully resolved and ready to go !");
        return resolvedControllers;
    }
}
