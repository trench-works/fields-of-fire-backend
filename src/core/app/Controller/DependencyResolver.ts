import "reflect-metadata";
import { Controllable, Instantiable } from "../Types/Instantiable";
import { Controller } from "..";
import { Configurable } from "../Types/Configurable";
import {
    ConfigService,
    DefaultConfig,
} from "../Providers/Defaults/ConfigService";
import { EnvObject } from "../Types/Env";
import {
    Logger,
} from "../Providers/Defaults/LoggerService";

function isInstantiable<Config extends EnvObject = DefaultConfig, T = unknown>(
    obj: Configurable<Config, T> | Instantiable<T>
): obj is Instantiable<T> {
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

type DependencyResolverOptions<Config extends EnvObject> = {
    controllers: Controllable[];
    providers: (Instantiable | Configurable<Config>)[];
};

export class DependencyResolver<Config extends EnvObject> {
    private readonly providerClassesMap = new Map<
        string,
        Instantiable | Configurable<Config>
    >();
    private readonly providersDependenciesMap = new Map<string, string[]>();

    private readonly controllerClasses: Controllable[];

    private readonly resolvedProviders = new Map<string, object>();

    constructor(
        { controllers, providers }: DependencyResolverOptions<Config>,
        private readonly configService: ConfigService<Config>,
        private readonly logger: Logger
    ) {
        this.resolvedProviders.set("ConfigService", this.configService);
        this.resolvedProviders.set("Logger", logger);
        this.logger.log("Building dependencies tree...");
        this.controllerClasses = controllers;
        for (const providerClass of providers) {
            this.providerClassesMap.set(providerClass.name, providerClass);
            const dependencies: string[] = [];
            for (const mdKey of Reflect.getMetadataKeys(providerClass)) {
                dependencies.push(Reflect.getMetadata(mdKey, providerClass));
            }
            this.providersDependenciesMap.set(providerClass.name, dependencies);
        }
        this.logger.log("Dependencies tree ready for compiling !");
    }

    private instantiate<ToInstantiate extends object = object | Controller>(
        instantiator:
            | Instantiable<ToInstantiate>
            | Configurable<Config, ToInstantiate>,
        dependenciesNames: string[]
    ): ToInstantiate {
        const dependencies: object[] = [];
        for (const dependencyName of dependenciesNames) {
            const dep = this.resolvedProviders.get(dependencyName);
            if (dep) {
                dependencies.push(dep);
            }
        }
        if (isInstantiable(instantiator)) {
            return new instantiator(...dependencies);
        } else {
            return instantiator(this.configService);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private resolvePropertyDependencies(provider: any) {
        for(const property of Object.keys(provider)) {
            const keys = Reflect.getMetadataKeys(provider, property);
            for(const key of keys) {
                const [type, propName] = key.split("-");
                if(type === "provider" && property === propName) {
                    const providerName: string = Reflect.getMetadata(key, provider, property);
                    if(this.resolvedProviders.has(providerName)) {
                        provider[property] = this.resolvedProviders.get(providerName);
                    } else {
                        this.logger.error(`Provider ${providerName} doesn't exist for property ${property} of element ${JSON.stringify(provider)}`)
                    }
                }
            }
        }
    }

    // private resolveAsyncDependencies(provider: Provider & AsyncProvided): void {
    //     const dependencies: Provider[] = [];
    //     console.log(Reflect.getMetadataKeys(provider, "asyncProvide"));
    //     for (const dependencyName of Reflect.getMetadataKeys(
    //         provider,
    //         "asyncProvide"
    //     )
    //         .filter((key) => String(key).startsWith("asyncProvider"))
    //         .map((key) => Number(String(key).split("-")[1]))
    //         .sort((a, b) => a - b)
    //         .map((mdKeyId) =>
    //             Reflect.getMetadata(
    //                 `asyncProvider-${mdKeyId}`,
    //                 provider,
    //                 "asyncProvide"
    //             )
    //         )) {
    //         const dep = this.resolvedProviders.get(dependencyName);
    //         dep && dependencies.push(dep);
    //     }
    //     console.log(dependencies);
    //     provider.asyncProvide(dependencies);
    // }

    build(): Controller[] {
        this.logger.log("Dependency tree compiling...");
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
            // console.log(isAsyncProvided(provider));
            // if (isAsyncProvided(provider)) {
            //     this.resolveAsyncDependencies(provider);
            // }
        }


        // Controllers Synchrone Resolving
        const resolvedControllers: Controller[] = this.controllerClasses.map(
            (controllerClass) => {
                const dependencies = Reflect.getMetadataKeys(controllerClass)
                    .filter((key) => String(key).startsWith("provider-constructor"))
                    .map((key) => Number(String(key).split("-")[2]))
                    .sort((a, b) => a - b)
                    .map((mdKeyId) =>
                        Reflect.getMetadata(
                            `provider-constructor-${mdKeyId}`,
                            controllerClass
                        )
                    );
                return this.instantiate(
                    controllerClass,
                    dependencies
                )
            }
        );
        for (const controller of resolvedControllers) {
            this.resolvePropertyDependencies(controller);
        }

        this.logger.log("Dependencies are fully resolved and ready to go !");
        return resolvedControllers;
    }
}
