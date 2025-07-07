import { Transform } from 'class-transformer';
import { IsNumber, IsPositive } from 'class-validator';

export class BuyItemDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsPositive()
  itemId: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsPositive()
  count: number;  // 新增购买数量字段
}
