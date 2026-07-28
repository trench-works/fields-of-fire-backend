import { LobbyTeam } from "../../../Lobby/data/LobbyTeam";

export class LobbyResponse {
    id!: string;
    name?: string;
    creator!: string;
    maxPlayers!: number;
    creatorId!: string;
    teams!: LobbyTeam[];
}

export class UpdateLobbyListResponse {
    lobbies!: LobbyResponse[];
}
