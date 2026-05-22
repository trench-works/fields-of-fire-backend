import { WsListenerOptions } from "..";

export enum RessourceAccessLevel {
  DELETE = 4,
  UPDATE = 3,
  CREATE = 2,
  READ = 1,
  NONE = 0,
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IGuard<
  RessourceKeyObject extends Record<string, unknown> = {},
> {
  validate(
    options: WsListenerOptions<RessourceKeyObject>,
  ): RessourceAccessLevel;
}
