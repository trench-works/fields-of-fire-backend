import { Controller, ListenerOptions, Provide } from "../../../core";
import { GameKey } from "../../Game/application/interfaces/GameKey";
import { LobbyService } from "../../Lobby/services/LobbyService";
import { CreateLobbyInterface } from "./interfaces/CreateLobbyInterface";

export class MenuController extends Controller {
    constructor(@Provide(LobbyService) lobbyService: LobbyService) {
        super({ topic: "menu", key: GameKey });
        this.on("create", this.createLobby.bind(this), {
            payloadType: CreateLobbyInterface,
        });
        this.on("join", this.joinLobby.bind(this));
    }

    createLobby({ payload }: ListenerOptions<{}, CreateLobbyInterface>) {
        /**
         * Do some logic to create a lobby
         * and then send event to client to move to lobby room
         * then kill client socket connection
         */
    }

    joinLobby() {
        /**
         * Do some logic to join a lobby
         * and then send event to client to move to lobby room
         * then kill client socket connection
         */
    }
}
