import { Controller, ControllerOptions } from "../core/app/Controller";
import { v4 as uuidv4 } from "uuid";

type CreatePayload = {
    playerId: string;
};

type JoinGamePayload = {
    gameId: string;
    playerId: string;
};

type GamePlayer = {
    id: string;
};

type Game = {
    id: string;
    creator: GamePlayer;
    players: GamePlayer[];
};

export class GameController extends Controller {
    private games: Game[] = [];

    constructor() {
        super({ path: "/games" });
        //create subscriptions for this controller
        this.onWs("create", this.handleCreate.bind(this));
        this.onWs("join", this.handleJoin.bind(this));
    }

    handleJoin(payload: JoinGamePayload) {
        const game = this.games.find((game) => game.id === payload.gameId);
        if (game) {
            game.players.push({ id: payload.playerId });
            this.emit({
                actionId: "joined",
                payload: game,
            });
        }
    }

    handleCreate(payload: CreatePayload) {
        this.games.push({
            id: uuidv4(),
            creator: { id: payload.playerId },
            players: [{ id: payload.playerId }],
        });
        console.log(JSON.stringify(this.games));
    }
}
