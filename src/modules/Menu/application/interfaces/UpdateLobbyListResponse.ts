import { GameMode } from "../../../Game/data/Game";
import { LobbyTeam } from "../../../Lobby/data/LobbyTeam";

export class LobbyResponse {
    id!: string;
    name?: string;
    creator!: string;
    maxPlayers!: number;
    creatorId!: string;
    teams!: LobbyTeam[];
    mode!: GameMode;
    boardSize!: number;
}

export class UpdateLobbyListResponse {
    lobbies!: LobbyResponse[];
}
