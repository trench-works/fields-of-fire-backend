import { Controller } from "../../../core";
import { GameKey } from "../../Game/application/interfaces/GameKey";
import { CreateLobbyInterface } from "./interfaces/CreateLobbyInterface";

export class MenuController extends Controller {
    constructor() {
        super({ topic: "menu", key: GameKey });
        this.on("create", this.createLobby.bind(this), {
            payloadType: CreateLobbyInterface,
        });
        this.on("join", this.joinLobby.bind(this));
    }

    createLobby() {
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
