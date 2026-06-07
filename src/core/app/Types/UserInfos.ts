import { IsNotEmpty, IsString } from "class-validator";

export class UserInfos {
  @IsString()
  @IsNotEmpty()
  id!: string;
}
