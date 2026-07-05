import { IsOptional, IsString } from "class-validator";

export class PlayerReady {
    @IsString()
    @IsOptional()
    boostId!: string | null;
}
