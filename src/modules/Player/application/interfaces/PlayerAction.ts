import { IsInt, IsNotEmpty, IsPositive, IsString, Min, ValidateNested } from "class-validator";

export class PlayerAction {
    @IsString()
    @IsNotEmpty()
    actionId !: string;
    @ValidateNested()
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