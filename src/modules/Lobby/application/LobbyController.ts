import { WsController, Provide, RessourceAccessLevel } from "../../../core";
import { LobbyKeys } from "./interfaces/LobbyKeys";
import { LobbyService } from "../services/LobbyService";
import { GameService } from "../../Game/services/GameService";
import { LobbyGuard } from "../services/LobbyGuard";
import { LobbyWebSocketManager } from "../web/LobbyWebSocketManager";
import { LobbyInputActions, LobbyOutputActions, LobbyReturnActions } from "./interfaces/LobbyAction";

export class LobbyController extends WsController<LobbyKeys, LobbyInputActions, LobbyOutputActions, LobbyReturnActions> {
    constructor(
        @Provide(LobbyService) private readonly lobbyService: LobbyService,
        @Provide(GameService) private readonly gameService: GameService,
        @Provide(LobbyGuard) lobbyGuard: LobbyGuard,
        @Provide(LobbyWebSocketManager) socketManager: LobbyWebSocketManager
    ) {
        super({ topic: "lobby", key: LobbyKeys, guards: [lobbyGuard], socketManager });
        //create subscriptions for this controller
        this.on(LobbyInputActions.LEAVE, this.handleLeave.bind(this));
        this.on(LobbyInputActions.START, this.startGame.bind(this), {
            accessLevel: RessourceAccessLevel.DELETE,
        });
    }

    async startGame() {
        /*
            some logic to transform this lobby into a running game
            and send event to all this lobby client to quit lobby screen and join game,
            then delete lobby and kill socket connections
        */
    }

    async handleLeave() {
        /*
            Some Logic to handle when player clicks on "quit" button
            or when client socket gets disconnected
        */
    }
}
