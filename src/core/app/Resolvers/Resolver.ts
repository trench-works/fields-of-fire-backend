import { App, Logger } from "../..";
import { EnvObject } from "../Types/Env";

export interface Resolver {
  prepare(controllers: object[], logger: Logger): ResolverApplier;
}

export interface ResolverApplier {
  apply<Config extends EnvObject>(app: App<Config>): void;
}
