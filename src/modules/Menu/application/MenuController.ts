import {
    WsController,
    Provide,
    WsListenerOptions,
    SingleClientOutputAction,
    NotFoundError,
} from "../../../core";
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

    constructor(
        @Provide(MenuWebSocketManager) socketManager: MenuWebSocketManager
    ) {
        super({ topic: "menu", key: MenuKey, socketManager });
        this.on(MenuInputActions.CREATE, this.createLobby.bind(this));
        this.on(MenuInputActions.JOIN, this.joinLobby.bind(this), {
            payloadType: JoinLobby,
            responsePayloadType: JoinLobbyResponse,
        });
        //TODO: add something to handle on connection event and answer potentially with "reconnect" callback
    }

    async createLobby({ user: { id } }: WsListenerOptions<MenuKey>) {
        this.lobbyService.createLobby(id);
    }

    async joinLobby({
        user: { id },
        payload: { lobbyId },
    }: WsListenerOptions<MenuKey, JoinLobby>): Promise<
        SingleClientOutputAction<JoinLobbyResponse, MenuReturnActions>
    > {
        const lobby = await this.lobbyService.joinLobby(lobbyId, id);
        if (lobby instanceof NotFoundError) {
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
