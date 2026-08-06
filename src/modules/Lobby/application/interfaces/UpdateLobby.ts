import { IsEnum, IsNumber, IsOptional } from "class-validator";
import { GameMode } from "../../../Game/data/Game";

export class UpdateLobby {
    @IsNumber()
    @IsOptional()
    boardSize?: number;
    @IsEnum(GameMode)
    @IsOptional()
    mode?: GameMode;
}
