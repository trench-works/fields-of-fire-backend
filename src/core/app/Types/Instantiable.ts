import { Controller } from "../Controller/Controller";
import { Module } from "../Module/Module";
import { DefaultConfig } from "../Providers/Defaults/ConfigService";
import { EnvObject } from "./Env";

export interface Instantiable<T = any> {
    new (...args: any[]): T;
}

export interface Controllable {
    new (...providers: any[]): Controller<any>;
}

export interface Modullable<Config extends EnvObject = DefaultConfig> {
    new (): Module<Config>;
}
