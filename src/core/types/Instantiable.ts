import { Controller } from "../app/Controller";
import { Module } from "../app/Module";
import { Provider } from "./Provider";

export interface Instantiable<T = any> extends Function {
    new (...args: any[]): T;
}

export interface Providable extends Function {
    new (...providers: any[]): Provider;
}

export interface Controllable extends Function {
    new (...providers: any[]): Controller<any>;
}

export interface Modullable extends Function {
    new (): Module;
}
