import { GameDataManager } from "../../Game/data/GameRepository";
import { Provide } from "../../../core";
import { LobbyDataManager } from "../data/LobbyDataManager";
import { LobbyInfo } from "../application/interfaces/LobbyInfo";

export class LobbyService {
  constructor(
    @Provide(LobbyDataManager)
    private readonly lobbyDataManager: LobbyDataManager,
    @Provide(GameDataManager)
    private readonly gameDataManager: GameDataManager,
  ) {}

  createLobby() {}

  getLobbiesList(): LobbyInfo[] {
    return this.lobbyDataManager.getLobbies().map(
      (lobby): LobbyInfo => ({
        lobbyId: lobby.id,
        playersCount: lobby.playersId.length,
      }),
    );
  }
}
