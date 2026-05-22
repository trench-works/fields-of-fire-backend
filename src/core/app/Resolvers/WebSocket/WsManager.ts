import { WebSocket } from "ws";
import { RessourceKeyUtils } from "../../Utils";
import {
  MultipleClientsOutputAction,
  SingleClientOutputAction,
} from "../../../types/Action";
import { Provide } from "../../../decorators";
import { Logger } from "../../Providers";

type RessourceClient<RessourceKeyObject extends Record<string, unknown>> = {
  socket: WebSocket;
  key: RessourceKeyObject;
};

export class WsManager<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any
  RessourceKeyObject extends Record<string, any> = {},
  OutputActions = string,
  ReturnActions = string,
> {
  public clients: Map<string, RessourceClient<RessourceKeyObject>>;

  @Provide("Logger") logger!: Logger;

  constructor() {
    this.clients = new Map();
  }

  set(userId: string, { socket, key }: RessourceClient<RessourceKeyObject>) {
    if (this.clients.has(userId)) {
      return;
    }
    this.clients.set(userId, { socket, key });
  }

  unset(userId: string) {
    if (!this.clients.has(userId)) {
      return;
    }
    this.clients.delete(userId);
  }

  send<PayloadObject extends object = object>(
    socket: WebSocket,
    action: SingleClientOutputAction<
      PayloadObject,
      OutputActions | ReturnActions
    >,
  ) {
    try {
      const message = JSON.stringify(action);
      socket.send(message);
    } catch {
      this.logger.error("CANT SEND PAYLOAD", JSON.stringify(action));
    }
  }

  emit(action: MultipleClientsOutputAction<RessourceKeyObject, OutputActions>) {
    for (const client of this.clients.values()) {
      if (RessourceKeyUtils.compareKeys(client.key, action.key)) {
        this.send(client.socket, action);
      }
    }
  }
}
