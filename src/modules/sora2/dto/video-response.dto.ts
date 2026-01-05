import { IsNotEmpty, IsString, IsNumber, IsArray, IsOptional, ValidateNested, IsBoolean } from "class-validator";
import { Type } from "class-transformer";

export class VideoResultDto {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsBoolean()
  removeWatermark: boolean;

  @IsNotEmpty()
  @IsString()
  pid: string;
}

export class VideoResponseDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VideoResultDto)
  results?: VideoResultDto[];

  @IsOptional()
  @IsNumber()
  progress?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  failure_reason?: string;

  @IsOptional()
  @IsString()
  error?: string;
}