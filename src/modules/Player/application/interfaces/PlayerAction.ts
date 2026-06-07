import {
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsString,
    ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { PlayerActionId } from "../../services/PlayerActionService";

export class PlayerAction {
    @IsEnum(PlayerActionId)
    @IsString()
    @IsNotEmpty()
    actionId!: PlayerActionId;
    @ValidateNested()
    @Type(() => Target)
    target!: Target;
}

export class Target {
    @IsInt()
    @IsNotEmpty()
    x!: number;
    @IsInt()
    @IsNotEmpty()
    y!: number;
}
