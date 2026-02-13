import { Controllable, Providable } from "../types/Instantiable";
import "reflect-metadata";
import { Provider } from "../types/Provider";
import { Controller } from "./Controller";

type DependencyResolverOptions = {
    controllerClasses: Controllable[];
    providerClasses: Providable[];
};

type ResolvedDependencies = {
    controllers: Controller[];
    providers: Provider[];
};

export class DependencyResolver {
    private readonly providerClassesMap = new Map<string, Providable>();
    private readonly providersDependenciesMap = new Map<string, string[]>();

    private readonly controllerClasses;

    private readonly resolvedProviders = new Map<string, Provider>();
    private readonly resolvedControllers: Controller[] = [];

    constructor({
        controllerClasses,
        providerClasses,
    }: DependencyResolverOptions) {
        console.log("Building dependencies tree...");
        this.controllerClasses = controllerClasses;
        for (const providerClass of providerClasses) {
            this.providerClassesMap.set(providerClass.name, providerClass);
            const dependencies: string[] = [];
            for (const mdKey of Reflect.getMetadataKeys(providerClass)) {
                dependencies.push(Reflect.getMetadata(mdKey, providerClass));
            }
            this.providersDependenciesMap.set(providerClass.name, dependencies);
        }
        console.log("Dependencies tree ready for compiling !");
    }

    private instantiate(
        instantiator: Providable | Controllable,
        dependenciesNames: string[]
    ): Provider | Controller {
        const dependencies: Provider[] = [];
        for (const dependencyName of dependenciesNames) {
            dependencies.push(this.resolvedProviders.get(dependencyName));
        }
        return new instantiator(...dependencies);
    }

    build() {
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
                    this.resolvedProviders.set(
                        providerName,
                        this.instantiate(instantiator, providerDependencies)
                    );
                    this.providersDependenciesMap.delete(providerName);
                }
            }
            if (providersSize === this.providersDependenciesMap.size) {
                throw new Error("RECURSIVE_DEPENDENCY", {
                    cause: "No dependency resolved during round of dependency resolving",
                });
            }
        }

        for (const controllerClass of this.controllerClasses) {
            const dependencies: string[] = [];
            for (const mdKey of Reflect.getMetadataKeys(controllerClass)) {
                dependencies.push(Reflect.getMetadata(mdKey, controllerClass));
            }
            this.resolvedControllers.push(
                this.instantiate(controllerClass, dependencies) as Controller
            );
        }
    }

    buildAsync() {}
}
