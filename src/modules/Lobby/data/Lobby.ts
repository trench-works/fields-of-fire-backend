export class LobbyPlayer {
    userId!: string;
    playerId!: string;
    classId!: string;
    name!: string;
}

export class Lobby {
    id!: string;
    name!: string;
    creatorName!: string;
    maxPlayers!: number;
    creatorId!: string;
    players!: LobbyPlayer[];
}
