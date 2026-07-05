import {
    WsController,
    Provide,
    WsListenerOptions,
    SingleClientOutputAction,
    WsBaseListenerOptions,
    SocketError,
} from "../../../core";
import { JoinGameResponse } from "../../Game/application/interfaces/JoinGameResponse";
import { GameService } from "../../Game/services/GameService";
import { LobbyService } from "../../Lobby/services/LobbyService";
import { LobbyPlayerService } from "../../Lobby/services/LobbysPlayerService";
import { MenuWebSocketManager } from "../web/MenuWebSocketManager";
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
        this.onSubscribe(this.onConnect.bind(this));
    }

    async onConnect({
        user: { id },
    }: WsBaseListenerOptions<MenuKey>): Promise<void | SingleClientOutputAction<
        JoinGameResponse | UpdateLobbyListResponse,
        MenuReturnActions.RECONNECT | MenuReturnActions.UPDATE
    >> {
        const game = await this.gameService.getPlayerCurrentGame(id);
        if (game) {
            return { actionId: MenuReturnActions.RECONNECT, payload: game };
        } else {
            const lobbies = await this.lobbyService.getLobbies();
            return {
                actionId: MenuReturnActions.UPDATE,
                payload: {
                    lobbies,
                },
            };
        }
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
