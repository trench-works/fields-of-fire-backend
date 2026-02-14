import { IGuard } from "../app";

export interface Guardable extends Function {
    new (...providers: any[]): IGuard;
}
