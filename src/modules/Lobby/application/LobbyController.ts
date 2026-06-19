import {
    WsController,
    Provide,
    WsListenerOptions,
    NotFoundError,
    SocketError,
} from "../../../core";
import { LobbyKeys } from "./interfaces/LobbyKeys";
import { LobbyService } from "../services/LobbyService";
import { GameService } from "../../Game/services/GameService";
import { LobbyWebSocketManager } from "../web/LobbyWebSocketManager";
import {
    LobbyInputActions,
    LobbyOutputActions,
    LobbyReturnActions,
} from "./interfaces/LobbyAction";
import { ChangeClass } from "./interfaces/ChangeClass";
import { SingleClientOutputError } from "../../../core/types/Action";
import { Game } from "../../Game/data/Game";
import { LobbyUpdate } from "./interfaces/LobbyUpdate";

export class LobbyController extends WsController<
    LobbyKeys,
    LobbyInputActions,
    LobbyOutputActions,
    LobbyReturnActions
> {
    constructor(
        @Provide(LobbyService) private readonly lobbyService: LobbyService,
        @Provide(GameService) private readonly gameService: GameService,
        @Provide(LobbyWebSocketManager) socketManager: LobbyWebSocketManager
    ) {
        super({
            topic: "lobby",
            key: LobbyKeys,
            socketManager,
        });
        //create subscriptions for this controller
        this.on(LobbyInputActions.LEAVE, this.handleLeave.bind(this));
        this.on(
            LobbyInputActions.CHANGE_CLASS,
            this.handleClassChange.bind(this),
            { payloadType: ChangeClass }
        );
        this.on(LobbyInputActions.START, this.startGame.bind(this));
    }

    async startGame({
        key: { lobbyId },
        user,
    }: WsListenerOptions<LobbyKeys>): Promise<void | SingleClientOutputError> {
        const game = await this.gameService.createGameFromLobby(
            lobbyId,
            user.id
        );
        if (game instanceof SocketError) {
            return game;
        }
        this.emit<Game>({
            actionId: LobbyOutputActions.START,
            key: { lobbyId },
            payload: game,
        });
    }

    async handleLeave({
        key: { lobbyId },
        user,
    }: WsListenerOptions<LobbyKeys>): Promise<void | SingleClientOutputError> {
        const lobby = await this.lobbyService.removePlayer(lobbyId, user.id);
        if (lobby instanceof NotFoundError) {
            return lobby;
        }
        this.emit<LobbyUpdate>({
            actionId: LobbyOutputActions.UPDATE,
            key: { lobbyId },
            payload: { lobby },
        });
    }

    async handleClassChange({
        key: { lobbyId },
        user,
        payload: { classId },
    }: WsListenerOptions<
        LobbyKeys,
        ChangeClass
    >): Promise<void | SingleClientOutputError> {
        const lobby = await this.lobbyService.changeClass(
            lobbyId,
            user.id,
            classId
        );
        if (lobby instanceof NotFoundError) {
            return lobby;
        }
        this.emit<LobbyUpdate>({
            actionId: LobbyOutputActions.UPDATE,
            key: { lobbyId },
            payload: { lobby },
        });
    }
}
