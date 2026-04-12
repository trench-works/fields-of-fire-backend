import { IsInt, IsNotEmpty, IsPositive, IsString, ValidateNested } from "class-validator";
import {Type} from "class-transformer"

export class PlayerAction {
    @IsString()
    @IsNotEmpty()
    actionId !: string;
    @ValidateNested()
    @Type(() => Target)
    target!: Target;
}

export class Target {
    @IsPositive()
    @IsInt()
    @IsNotEmpty()
    x!: number;
    @IsInt()
    @IsNotEmpty()
    y!: number;
}