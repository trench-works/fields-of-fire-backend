import { GameMode } from "../../Game/data/Game";
import { Mastery } from "../../Mastery/data/Mastery";
import { LobbyTeam } from "./LobbyTeam";

export class LobbyPlayer {
    userId!: string;
    playerId!: string;
    classId!: string;
    name!: string;
    mastery?: Mastery;
}

export class Lobby {
    id!: string;
    mode!: GameMode;
    boardSize!: number;
    name!: string;
    creatorName!: string;
    maxPlayers!: number;
    creatorId!: string;
    teams!: LobbyTeam[];
    playerReady!: string[];
}
