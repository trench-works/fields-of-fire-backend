import { IsNotEmpty, IsNumber } from "class-validator";

export class LobbyKeys {
    @IsNumber()
    @IsNotEmpty()
    lobbyId!: string;
}
