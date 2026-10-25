import {
    WsController,
    Provide,
    WsListenerOptions,
    SingleClientOutputAction,
    SocketError,
    HttpError,
    NotFoundError,
} from "../../../core";
import { JoinGameResponse } from "../../Game/application/interfaces/JoinGameResponse";
import { GameService } from "../../Game/services/GameService";
import { LobbyService } from "../../Lobby/services/LobbyService";
import { LobbyPlayerService } from "../../Lobby/services/LobbysPlayerService";
import { MenuWebSocketManager } from "../web/MenuWebSocketManager";
import { JoinGame } from "./interfaces/JoinGame";
import { JoinLobby } from "./interfaces/JoinLobby";
import { JoinLobbyResponse } from "./interfaces/JoinLobbyResponse";
import {
    MenuInputActions,
    MenuOutputActions,
    MenuReturnActions,
} from "./interfaces/MenuActions";
import { MenuKey } from "./interfaces/MenuKey";
import { UpdateLobbyListResponse } from "./interfaces/UpdateLobbyListResponse";

export class MenuController extends WsController<
    MenuKey,
    MenuInputActions,
    MenuOutputActions,
    MenuReturnActions
> {
    @Provide(LobbyService)
    private readonly lobbyService!: LobbyService;
    @Provide(LobbyPlayerService)
    private readonly lobbyPlayerService!: LobbyPlayerService;
    @Provide(GameService)
    private readonly gameService!: GameService;

    constructor(
        @Provide(MenuWebSocketManager) socketManager: MenuWebSocketManager
    ) {
        super({ topic: "menu", key: MenuKey, socketManager });
        this.on(MenuInputActions.CREATE, this.createLobby.bind(this));
        this.on(MenuInputActions.JOIN, this.joinLobby.bind(this), {
            payloadType: JoinLobby,
            responsePayloadType: JoinLobbyResponse,
        });
        this.on(MenuInputActions.RECONNECT, this.reconnect.bind(this), {
            payloadType: JoinGame,
            responsePayloadType: JoinGameResponse,
        });
        this.onSubscribe(this.onConnect.bind(this));
    }

    async reconnect({
        user: { id },
        payload: { gameId },
    }: WsListenerOptions<
        MenuKey,
        JoinGame
    >): Promise<void | SingleClientOutputAction<
        JoinGameResponse,
        MenuReturnActions.RECONNECT
    >> {
        const game = await this.gameService.getPlayerGame(gameId, id);
        if (!game) {
            return new NotFoundError();
        }
        return {
            actionId: MenuReturnActions.RECONNECT,
            payload: game,
        };
    }

    async onConnect(): Promise<void | SingleClientOutputAction<
        UpdateLobbyListResponse,
        MenuReturnActions.UPDATE
    >> {
        const lobbies = await this.lobbyService.getLobbies();
        return {
            actionId: MenuReturnActions.UPDATE,
            payload: {
                lobbies,
            },
        };
    }

    async createLobby({
        user: { id },
    }: WsListenerOptions<MenuKey>): Promise<
        SingleClientOutputAction<JoinLobbyResponse, MenuReturnActions>
    > {
        const lobby = await this.lobbyService.createLobby(id);
        if (!lobby) {
            return;
        }
        if (lobby instanceof HttpError) {
            return lobby;
        }
        return {
            actionId: MenuReturnActions.JOIN,
            payload: {
                lobby,
            },
        };
    }
    async joinLobby({
        user: { id },
        payload: { lobbyId },
    }: WsListenerOptions<MenuKey, JoinLobby>): Promise<
        SingleClientOutputAction<JoinLobbyResponse, MenuReturnActions>
    > {
        const lobby = await this.lobbyPlayerService.addPlayerToLobby(
            lobbyId,
            id
        );
        if (lobby instanceof SocketError) {
            return lobby;
        }
        return {
            actionId: MenuReturnActions.JOIN,
            payload: {
                lobby: lobby,
            },
        };
    }
}
