import { LobbyPlayer } from "../../../Lobby/data/Lobby";

export class LobbyResponse {
    id!: string;
    name?: string;
    creator!: string;
    maxPlayers!: number;
    creatorId!: string;
    players!: LobbyPlayer[];
}

export class UpdateLobbyListResponse {
    lobbies!: LobbyResponse[];
}
