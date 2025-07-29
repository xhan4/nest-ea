import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateSectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  founderId: number; // 创建者ID

  @IsNumber()
  @IsOptional()
  level?: number = 1; // 默认1级

  @IsString()
  @IsOptional()
  banner?: string; // 旗帜
}