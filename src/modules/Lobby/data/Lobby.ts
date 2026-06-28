import { GameMode } from "../../Game/data/Game";

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
    players!: LobbyPlayer[];
    playerReady!: string[];
}
