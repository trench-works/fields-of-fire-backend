import { WsListenerOptions } from "..";

export enum RessourceAccessLevel {
    DELETE = 4,
    UPDATE = 3,
    CREATE = 2,
    READ = 1,
    NONE = 0,
}

export interface IGuard<
    RessourceKeyObject extends Record<string, unknown> = any,
> {
    validate(
        options: WsListenerOptions<RessourceKeyObject>
    ): Promise<RessourceAccessLevel>;
}
