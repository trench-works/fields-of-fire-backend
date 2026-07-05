import { IsNotEmpty, IsString } from "class-validator";

export class Authenticate {
    @IsString()
    @IsNotEmpty()
    username!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;
}
