import { Controller, ControllerOptions } from "../../core/app/Controller";
import { v4 as uuidv4 } from "uuid";
import { LobbyService } from "../services/LobbyService";
import { Provide } from "../../core/decorators/Provide";
import { IsNumber, IsString } from "class-validator";

class CreatePayload {
    @IsString()
    userId: string;
}

type GamePlayer = {
    userId: string;
};

type Game = {
    id: string;
    creator: GamePlayer;
    players: GamePlayer[];
};

class LobbyKeys {
    @IsNumber()
    lobbyId: number;
}

class JoinGamePayload {
    @IsString()
    gameId: string;
    @IsString()
    userId: string;
}

export class LobbyController extends Controller {
    private games: Game[] = [];

    constructor(
        @Provide(LobbyService) private readonly lobbyService: LobbyService
    ) {
        super({ topic: "lobby", key: LobbyKeys });
        //create subscriptions for this controller
        this.on("join", this.handleJoin.bind(this), JoinGamePayload);
        this.on("create", this.handleCreate.bind(this), CreatePayload);
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
