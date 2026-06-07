import { WsManager } from "../../../core";
import {
    MenuOutputActions,
    MenuReturnActions,
} from "../application/interfaces/MenuActions";
import { MenuKey } from "../application/interfaces/MenuKey";

export class MenuWebSocketManager extends WsManager<
    MenuKey,
    MenuOutputActions,
    MenuReturnActions
> {}
