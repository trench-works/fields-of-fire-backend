import { IsNotEmpty, IsString } from "class-validator";

export class LobbyKeys {
    @IsString()
    @IsNotEmpty()
    lobbyId!: string;
}
