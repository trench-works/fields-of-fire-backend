import { IsString } from "class-validator";

export class CreateLobbyInterface {
  @IsString()
  userId!: string;
}
