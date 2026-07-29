import { GameMode } from "../../Game/data/Game";
import { LobbyTeam } from "./LobbyTeam";

export class LobbyPlayer {
    userId!: string;
    playerId!: string;
    classId!: string;
    name!: string;
}

export class Lobby {
    id!: string;
    mode!: GameMode;
    name!: string;
    creatorName!: string;
    maxPlayers!: number;
    creatorId!: string;
    teams!: LobbyTeam[];
    playerReady!: string[];
}
