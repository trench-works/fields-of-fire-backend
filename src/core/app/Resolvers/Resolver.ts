import { App, Logger, TokenService } from "../..";
import { EnvObject } from "../Types/Env";

export interface Resolver {
    prepare(
        controllers: object[],
        logger: Logger,
        tokenService: TokenService
    ): ResolverApplier;
}

export interface ResolverApplier {
    apply<Config extends EnvObject>(app: App<Config>): void;
}
