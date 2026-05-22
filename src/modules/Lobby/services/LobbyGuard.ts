import {
  IGuard,
  WsListenerOptions,
  NotFoundError,
  Provide,
  RessourceAccessLevel,
} from "../../../core";
import { LobbyKeys } from "../application/interfaces/LobbyKeys";
import { LobbyDataManager } from "../data/LobbyDataManager";

export class LobbyGuard implements IGuard {
  constructor(
    @Provide(LobbyDataManager)
    private readonly lobbyDataManager: LobbyDataManager,
  ) {}

  validate({ user, key }: WsListenerOptions<LobbyKeys>): RessourceAccessLevel {
    const lobby = this.lobbyDataManager.getLobby(key.lobbyId);
    if (lobby instanceof NotFoundError) {
      return RessourceAccessLevel.NONE;
    }
    if (lobby.creatorId === user.id) {
      return RessourceAccessLevel.DELETE;
    }
    if (lobby.playersId.includes(user.id)) {
      return RessourceAccessLevel.READ;
    }
    return RessourceAccessLevel.NONE;
  }
}
