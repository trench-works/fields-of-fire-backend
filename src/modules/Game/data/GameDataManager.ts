import { Game } from "./Game";

export class GameDataManager {
    private readonly games: Game[] = [
        {
            id: "3630",
            creatorId: "dev",
            players: [
                {
                    id: "arthurchar",
                    userId: "dev",
                    characterClass: {},
                    stats: {
                        speed: 10,
                        hp: 200,
                    },
                    position: {
                        x: 2,
                        y: 2,
                    },
                    modifier: [],
                },
            ],
        },
    ];

    createGame(game: Game) {
        this.games.push(game);
    }

    getGamesList() {
        return [...this.games];
    }

    getGame(id: string) {
        return this.games.find((game) => game.id === id);
    }
}
