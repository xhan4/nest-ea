import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, IsArray, ValidateNested, IsEnum } from "class-validator";
import { Type } from "class-transformer";

export class CharacterDto {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsString()
  timestamps: string;
}

export enum AspectRatio {
  NINE_SIXTEEN = "9:16",
  SIXTEEN_NINE = "16:9"
}

export enum VideoSize {
  SMALL = "small",
  LARGE = "large"
}

export class CreateVideoDto {
  @IsNotEmpty()
  @IsString()
  model: string;

  @IsNotEmpty()
  @IsString()
  prompt: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsEnum(AspectRatio)
  aspectRatio?: AspectRatio;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsString()
  remixTargetId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CharacterDto)
  characters?: CharacterDto[];

  @IsOptional()
  @IsEnum(VideoSize)
  size?: VideoSize;

  @IsOptional()
  @IsString()
  webHook?: string;

  @IsOptional()
  @IsBoolean()
  shutProgress?: boolean;
}