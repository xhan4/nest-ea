import { IsNumber, IsPositive } from 'class-validator';

export class ListItemDto {
  @IsNumber()
  @IsPositive()
  userId: number;

  @IsNumber()
  @IsPositive()
  itemId: number;

  @IsNumber()
  @IsPositive()
  price: number;
}
