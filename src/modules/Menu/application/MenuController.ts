import { WsController, Provide } from "../../../core";
import { GameKey } from "../../Game/application/interfaces/GameKey";
import { GameWebSocketManager } from "../../Game/web/GameWebSocketManager";
import { CreateLobbyInterface } from "./interfaces/CreateLobbyInterface";

export class MenuController extends WsController {
  constructor(
    @Provide(GameWebSocketManager) socketManager: GameWebSocketManager,
  ) {
    super({ topic: "menu", key: GameKey, socketManager });
    this.on("create", this.createLobby.bind(this), {
      payloadType: CreateLobbyInterface,
    });
    this.on("join", this.joinLobby.bind(this));
  }

  async createLobby() {
    /**
     * Do some logic to create a lobby
     * and then send event to client to move to lobby room
     * then kill client socket connection
     */
  }

  async joinLobby() {
    /**
     * Do some logic to join a lobby
     * and then send event to client to move to lobby room
     * then kill client socket connection
     */
  }
}
