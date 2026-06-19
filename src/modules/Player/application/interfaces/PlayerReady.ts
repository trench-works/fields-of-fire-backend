import { IsNotEmpty, IsString } from "class-validator";

export class PlayerReady {
    @IsString()
    @IsNotEmpty()
    boostId!: string;
}
