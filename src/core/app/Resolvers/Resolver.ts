import { App, Controller, Logger } from "../..";
import { EnvObject } from "../Types/Env";

export interface Resolver {
    prepare(controllers: Controller[], logger: Logger): Resolver;
    apply<Config extends EnvObject>(app: App<Config>): void;
}
