import { IsString, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class CreateItemDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  type: string;

  @IsNumber()
  @IsPositive()
  rarity: number;
}
