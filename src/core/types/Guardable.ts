import { IGuard } from "../app";

export interface Guardable {
  new (...providers: object[]): IGuard;
}
