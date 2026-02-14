import { IsNumber } from "class-validator";

export class LobbyKeys {
    @IsNumber()
    lobbyId!: string;
}
