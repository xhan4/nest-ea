import { IsNumber, IsDefined, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PositionDto {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;
}

export class CreatePlotDto {
  @IsNumber()
  sectId: number;

  @IsDefined()
  @ValidateNested()
  @Type(() => PositionDto)
  position: PositionDto;
}