import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ItemType } from 'src/core/enums/item-type.enum';
export class CreateItemDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  desc?: string;

  @IsString()
  type: ItemType;

  @IsNumber()
  price: number;
}
