import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsPositive } from 'class-validator';

export class CompleteTradeDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsPositive()
  itemId: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsPositive()
  count: number;

  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isSuccess: boolean;
}
