import { IsNotEmpty, MinLength } from "class-validator";
export class CreateUserDto {
  @IsNotEmpty({
    message: "用户名不能为空",
  })
  username: string;
  @IsNotEmpty({
    message: "密码不能为空",
  })
  @MinLength(6, {
    message: "密码不能少于6位",
  })
  password: string;
  @IsNotEmpty({
    message: "appId不能为空",
  })
  app_id: string;
}
