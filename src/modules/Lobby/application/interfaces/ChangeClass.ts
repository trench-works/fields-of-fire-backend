import { IsNotEmpty, IsString } from "class-validator";

export class ChangeClass {
    @IsString()
    @IsNotEmpty()
    classId!: string;
}
