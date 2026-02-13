import { Controllable, Providable } from "../types/Instantiable";

export type ModuleConfig = {
    controllers?: Controllable[];
    providers?: Providable[];
};

export class Module {
    constructor(public readonly config: ModuleConfig) {}
}
