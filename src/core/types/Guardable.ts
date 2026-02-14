import { Guard } from "../app";

export interface Guardable extends Function {
    new (...providers: any[]): Guard;
}
