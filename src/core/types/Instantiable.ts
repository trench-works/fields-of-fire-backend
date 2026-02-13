import { Controller } from "../app/Controller";
import { Provider } from "./Provider";

export interface Instantiable<T = any> extends Function {
    new (...args: any[]): T;
}

export interface Providable extends Function {
    new (...providers: Provider[]): Provider;
}

export interface Controllable extends Function {
    new (...providers: Provider[]): Controller;
}
