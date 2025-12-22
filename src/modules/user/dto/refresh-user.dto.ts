import { IsNotEmpty } from "class-validator";
export class RefreshUserDto {
  @IsNotEmpty({
    message: "refresh_token不能为空",
  })
  refresh_token:string
  appId?:string;
}
