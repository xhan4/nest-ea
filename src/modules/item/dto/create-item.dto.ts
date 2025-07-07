import { Transform } from 'class-transformer';
import { IsString, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class CreateItemDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  type: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsPositive()
  rarity: number;
}
