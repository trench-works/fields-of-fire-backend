import { Controller } from "../../../core/app/Controller";
import { Provide } from "../../../core/decorators/Provide";
import { LobbyService } from "../../Lobby/services/LobbyService";
import { CreateLobbyInterface } from "./interfaces/CreateLobbyInterface";

export class MenuController extends Controller {
    constructor(@Provide(LobbyService) lobbyService: LobbyService) {
        super({ topic: "menu" });
        this.on("create", this.createLobby.bind(this), CreateLobbyInterface);
        this.on("join", this.joinLobby.bind(this));
    }

    createLobby(payload: CreateLobbyInterface) {
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
