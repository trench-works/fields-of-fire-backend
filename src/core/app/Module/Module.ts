import { Controllable, Instantiable } from "../Types/Instantiable";

type ModuleConfig = {
    controllers?: Controllable[];
    providers?: Instantiable[];
};

export class Module {
    constructor(public readonly config: ModuleConfig) {}
}
