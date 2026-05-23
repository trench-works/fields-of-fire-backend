export class LobbyPlayer {
    userId!: string;
    playerId!: string;
    classId!: string;
}

export class Lobby {
    id!: string;
    creatorId!: string;
    players!: LobbyPlayer[];
}
