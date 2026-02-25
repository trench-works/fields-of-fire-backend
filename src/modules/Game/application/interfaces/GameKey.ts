import { IsNotEmpty, IsString } from "class-validator";

export class GameKey {
    @IsString()
    @IsNotEmpty()
    gameId!: string;
}
