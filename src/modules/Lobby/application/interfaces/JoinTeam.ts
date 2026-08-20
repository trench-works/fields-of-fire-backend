import { IsNotEmpty, IsNumber, Max, Min } from "class-validator";

export class JoinTeam {
    @Max(3)
    @Min(0)
    @IsNumber()
    @IsNotEmpty()
    index!: number;
}
