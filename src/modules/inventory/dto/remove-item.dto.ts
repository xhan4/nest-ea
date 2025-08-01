import { Transform } from "class-transformer";
import { IsNumber, IsPositive } from "class-validator";

export class RemoveItemDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsPositive()
  characterId: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsPositive()
  itemId: number;
  
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsPositive()
  count: number;
}