import { IsNotEmpty, IsString } from "class-validator";

export class JoinLobby {
    @IsString()
    @IsNotEmpty()
    lobbyId!: string;
}
