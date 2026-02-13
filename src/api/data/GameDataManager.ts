import { Game } from "../types/Game";

export class GameDataManager {
    private readonly games: Game[] = [];

    createGame() {
        this.games.push({ id: "oui" });
    }

    getGamesList() {
        return [...this.games];
    }

    getGame(id: string) {
        return this.games.find((game) => game.id === id);
    }
}
