import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class Register {
    @IsString()
    @IsNotEmpty()
    username!: string;

    @IsString()
    @IsStrongPassword()
    @IsNotEmpty()
    password!: string;
}
