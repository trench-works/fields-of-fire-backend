import { IsObject, Validate } from "class-validator";

export class UpdateMasteries {
    @IsObject()
    masteries!: Record<string, number>;
}