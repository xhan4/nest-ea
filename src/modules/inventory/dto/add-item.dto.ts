import { IsNumber, IsPositive } from 'class-validator';

export class AddItemDto {
  @IsNumber()
  @IsPositive()
  userId: number;

  @IsNumber()
  @IsPositive()
  itemId: number;

  @IsNumber()
  @IsPositive()
  count: number;
}
