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
import { LobbyPlayerService } from "../services/LobbysPlayerService";
import { PlayerReady } from "./interfaces/PlayerReady";
import { UpdateLobby } from "./interfaces/UpdateLobby";
import { JoinTeam } from "./interfaces/JoinTeam";

export class LobbyController extends WsController<
    LobbyKeys,
    LobbyInputActions,
    LobbyOutputActions,
    LobbyReturnActions
> {
    constructor(
        @Provide(LobbyService) private readonly lobbyService: LobbyService,
        @Provide(LobbyPlayerService)
        private readonly lobbyPlayerService: LobbyPlayerService,
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
        this.on(LobbyInputActions.READY, this.handleSetReady.bind(this));
        this.on(LobbyInputActions.START, this.startGame.bind(this));
        this.on(LobbyInputActions.JOIN_TEAM, this.joinTeam.bind(this));
        this.on(LobbyInputActions.ADD_TEAM, this.addTeam.bind(this));
        this.on(LobbyInputActions.UPDATE, this.update.bind(this), {
            payloadType: UpdateLobby,
        });
    }

    async update({
        key: { lobbyId },
        user,
        payload,
    }: WsListenerOptions<LobbyKeys, UpdateLobby>) {
        await this.lobbyService.updateLobby(lobbyId, user, payload);
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
    }

    async joinTeam({
        key: { lobbyId },
        user,
        payload: { index },
    }: WsListenerOptions<
        LobbyKeys,
        JoinTeam
    >): Promise<void | SingleClientOutputError> {
        return await this.lobbyService.joinTeam(lobbyId, user.id, index);
    }

    async addTeam({
        key: { lobbyId },
        user,
    }: WsListenerOptions<LobbyKeys>): Promise<void | SingleClientOutputError> {
        return await this.lobbyService.addTeam(lobbyId, user.id);
    }

    async handleLeave({
        key: { lobbyId },
        user,
    }: WsListenerOptions<LobbyKeys>): Promise<void | SingleClientOutputError> {
        const lobby = await this.lobbyPlayerService.removePlayer(
            lobbyId,
            user.id
        );
        if (lobby instanceof NotFoundError) {
            return lobby;
        }
    }

    async handleClassChange({
        key: { lobbyId },
        user,
        payload: { classId },
    }: WsListenerOptions<
        LobbyKeys,
        ChangeClass
    >): Promise<void | SingleClientOutputError> {
        const lobby = await this.lobbyPlayerService.changeClass(
            lobbyId,
            user.id,
            classId
        );
        if (lobby instanceof NotFoundError) {
            return lobby;
        }
    }

    async handleSetReady({
        key: { lobbyId },
        payload: { playerId },
    }: WsListenerOptions<
        LobbyKeys,
        PlayerReady
    >): Promise<void | SingleClientOutputError> {
        const lobby = await this.lobbyPlayerService.setLobbyPlayerReady(
            lobbyId,
            playerId
        );
        if (lobby instanceof NotFoundError || !lobby) {
            return lobby;
        }
    }
}
