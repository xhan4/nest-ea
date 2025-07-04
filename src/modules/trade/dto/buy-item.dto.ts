import { IsNumber, IsPositive } from 'class-validator';

export class BuyItemDto {
  @IsNumber()
  @IsPositive()
  itemId: number;
}
