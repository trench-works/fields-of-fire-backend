import { WsManager } from "../../../core";
import {
    MenuOutputActions,
    MenuReturnActions,
} from "../application/interfaces/MenuActions";
import { MenuKey } from "../application/interfaces/MenuKey";
import {
    LobbyResponse,
    UpdateLobbyListResponse,
} from "../application/interfaces/UpdateLobbyListResponse";

export class MenuWebSocketManager extends WsManager<
    MenuKey,
    MenuOutputActions,
    MenuReturnActions
> {
    async emitLobbiesUpdate(lobbies: LobbyResponse[]) {
        await this.emit<UpdateLobbyListResponse>({
            key: {},
            actionId: MenuOutputActions.UPDATE,
            payload: {
                lobbies,
            },
        });
    }
}
