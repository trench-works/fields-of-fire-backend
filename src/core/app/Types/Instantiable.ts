import { Module } from "../Module/Module";
import { DefaultConfig } from "../Providers/Defaults/ConfigService";
import { EnvObject } from "./Env";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Instantiable<T = any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (...args: any[]): T;
}

export interface Controllable {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (...providers: any[]): object;
}

export interface Modullable<Config extends EnvObject = DefaultConfig> {
    new (): Module<Config>;
}
