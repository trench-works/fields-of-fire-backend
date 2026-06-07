export class LobbyPlayer {
    userId!: string;
    playerId!: string;
    classId!: string;
}

export class Lobby {
    id!: string;
    maxPlayers!: number;
    creatorId!: string;
    players!: LobbyPlayer[];
}
