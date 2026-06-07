import { SocketError } from "./SocketError";

export class ActionImpossible extends SocketError {
  constructor() {
    super("ACTION_IMPOSSIBLE");
  }
}
