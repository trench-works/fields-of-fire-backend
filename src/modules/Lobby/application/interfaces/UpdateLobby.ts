import {
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
} from "class-validator";
import { GameMode } from "../../../Game/data/Game";

export class UpdateLobby {
    @IsNumber()
    @IsOptional()
    boardSize?: number;
    @IsEnum(GameMode)
    @IsOptional()
    mode?: GameMode;
    @MaxLength(30)
    @IsString()
    @IsOptional()
    name?: string;
}
