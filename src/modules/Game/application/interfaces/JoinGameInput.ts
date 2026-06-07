import { IsNotEmpty, IsString } from "class-validator";

export class JoinGameInput {
  @IsString()
  @IsNotEmpty()
  characterClassId!: string;
}
