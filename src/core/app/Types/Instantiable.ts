import { Controller } from "../Controller/Controller";
import { Module } from "../Module/Module";

export interface Instantiable<T = any> extends Function {
    new (...args: any[]): T;
}

export interface Controllable extends Function {
    new (...providers: any[]): Controller<any>;
}

export interface Modullable extends Function {
    new (): Module;
}
