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
import { MenuWebSocketManager } from "../web/MenuWebSocketManager";
import { JoinLobby } from "./interfaces/JoinLobby";
import { JoinLobbyResponse } from "./interfaces/JoinLobbyResponse";
import {
    MenuInputActions,
    MenuOutputActions,
    MenuReturnActions,
} from "./interfaces/MenuActions";
import { MenuKey } from "./interfaces/MenuKey";

export class MenuController extends WsController<
    MenuKey,
    MenuInputActions,
    MenuOutputActions,
    MenuReturnActions
> {
    @Provide(LobbyService)
    private readonly lobbyService!: LobbyService;
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
        //TODO: add something to handle on connection event and answer potentially with "reconnect" callback
    }

    async onConnect({
        user: { id },
    }: WsBaseListenerOptions<MenuKey>): Promise<void | SingleClientOutputAction<
        JoinGameResponse,
        MenuReturnActions
    >> {
        const game = await this.gameService.getPlayerCurrentGame(id);
        if (game) {
            return { actionId: MenuReturnActions.RECONNECT, payload: game };
        }
    }

    async createLobby({
        user: { id },
    }: WsListenerOptions<MenuKey>): Promise<
        SingleClientOutputAction<JoinLobbyResponse, MenuReturnActions>
    > {
        const lobby = await this.lobbyService.createLobby(id);
        return {
            actionId: MenuReturnActions.JOIN,
            payload: {
                lobbyId: lobby.id,
                playerId: lobby.players.find((player) => player.userId === id)!
                    .playerId,
            },
        };
    }

    async joinLobby({
        user: { id },
        payload: { lobbyId },
    }: WsListenerOptions<MenuKey, JoinLobby>): Promise<
        SingleClientOutputAction<JoinLobbyResponse, MenuReturnActions>
    > {
        const lobby = await this.lobbyService.addPlayerToLobby(lobbyId, id);
        if (lobby instanceof SocketError) {
            return { error: lobby };
        }
        return {
            actionId: MenuReturnActions.JOIN,
            payload: {
                lobbyId: lobby.id,
                playerId: lobby.players.find((player) => player.userId === id)!
                    .playerId,
            },
        };
    }
}
