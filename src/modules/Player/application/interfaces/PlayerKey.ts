import { IsString } from "class-validator";

export class PlayerKey {
  @IsString()
  gameId!: string;
  @IsString()
  playerId!: string;
}
