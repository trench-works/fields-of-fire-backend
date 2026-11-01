import { App } from "../..";
import { EnvObject } from "../Types/Env";

export interface Resolver {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prepare(controllers: object[], ...providers: any[]): ResolverApplier;
}

export interface ResolverApplier {
    apply<Config extends EnvObject>(app: App<Config>): void;
}
