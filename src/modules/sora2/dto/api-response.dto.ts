import { IsNumber, IsString, IsObject, IsOptional } from "class-validator";
import { Type } from "class-transformer";
import { VideoResponseDto } from "./video-response.dto";

export class ApiResponseDto<T> {
  @IsNumber()
  code: number;

  @IsString()
  msg: string;

  @IsObject()
  @Type(() => VideoResponseDto)
  data: T;
}