import { Controller } from "../../../core/app/Controller";
import { Provide } from "../../../core/decorators/Provide";
import { LobbyKeys } from "./interfaces/LobbyKeys";
import { LobbyService } from "../services/LobbyService";
import { GameService } from "../../Game/services/GameService";

export class LobbyController extends Controller<LobbyKeys> {
    constructor(
        @Provide(LobbyService) private readonly lobbyService: LobbyService,
        @Provide(GameService) private readonly gameService: GameService
    ) {
        super({ topic: "lobby", key: LobbyKeys });
        //create subscriptions for this controller
        this.on("leave", this.handleLeave.bind(this));
        this.on("start", this.startGame.bind(this));
    }

    startGame() {
        /*
            some logic to transform this lobby into a running game
            and send event to all this lobby client to quit lobby screen and join game,
            then delete lobby and kill socket connections
        */
    }

    handleLeave() {
        /*
            Some Logic to handle when player clicks on "quit" button
            or when client socket gets disconnected
        */
    }
}
