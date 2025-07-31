import { IsString, IsNumber, IsOptional } from 'class-validator';
export class CreateItemDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  desc?: string;

  @IsString()
  type: string;

  @IsNumber()
  price: number;
}
