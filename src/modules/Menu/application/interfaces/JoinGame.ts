import { IsNotEmpty, IsString } from "class-validator";

export class JoinGame {
    @IsString()
    @IsNotEmpty()
    gameId!: string;
}
