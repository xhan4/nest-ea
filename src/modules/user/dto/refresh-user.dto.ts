import { IsNotEmpty } from "class-validator";
export class RefreshUserDto {
  @IsNotEmpty({
    message: "refresh_token不能为空",
  })
  refresh_token:string
  @IsNotEmpty({
    message: "app_id不能为空",
  })
  app_id:string;
}
