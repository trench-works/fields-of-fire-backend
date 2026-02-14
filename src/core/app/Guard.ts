import { ListenerOptions } from ".";

export enum RessourceAccessLevel {
    DELETE = 4,
    UPDATE = 3,
    CREATE = 2,
    READ = 1,
    NONE = 0,
}

export interface IGuard {
    validate(options: ListenerOptions): RessourceAccessLevel;
}
