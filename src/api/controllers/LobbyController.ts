import { Controller, ControllerOptions } from "../../core/app/Controller";
import { v4 as uuidv4 } from "uuid";
import { LobbyService } from "../services/LobbyService";
import { Provide } from "../../core/decorators/Provide";

type CreatePayload = {
    userId: string;
};

type JoinGamePayload = {
    gameId: string;
    userId: string;
};

type GamePlayer = {
    userId: string;
};

type Game = {
    id: string;
    creator: GamePlayer;
    players: GamePlayer[];
};

export class LobbyController extends Controller {
    private games: Game[] = [];

    constructor(
        @Provide(LobbyService) private readonly lobbyService: LobbyService
    ) {
        super({ path: "/lobby" });
        //create subscriptions for this controller
        this.on("create", this.handleCreate.bind(this));
        this.on("join", this.handleJoin.bind(this));
    }

    handleJoin(payload: JoinGamePayload) {
        const game = this.games.find((game) => game.id === payload.gameId);
        if (game) {
            game.players.push({ userId: payload.userId });
            this.emit({
                actionId: "joined",
                payload: game,
            });
        }
    }

    handleCreate(payload: CreatePayload) {
        this.games.push({
            id: uuidv4(),
            creator: { userId: payload.userId },
            players: [{ userId: payload.userId }],
        });
        console.log(JSON.stringify(this.games));
    }
}
