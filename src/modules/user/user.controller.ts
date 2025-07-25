import { Body, Controller, Get, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshUserDto } from './dto/refresh-user.dto';
import { Public } from 'src/core/decorators/public.decorator';
import { Roles } from 'src/core/decorators/rules.decorator';
import { RoleEnum } from 'src/core/enums/roles.enum';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }
    //注册用户
    @Public()
    @Post('register')
    create(@Body() createUserDto: CreateUserDto,@Req() req) {
        const appId = req.headers['x-app-id']
        return this.userService.registe({...createUserDto,appId});
    }
    //登录用户
    @Public()
    @Post('login')
    login(@Body() loginDto:LoginUserDto,@Req() req){
        const appId = req.headers['x-app-id']
        const {username,password} = loginDto
        return this.userService.login({username,password,appId})
    }
    
    //刷新token
    @Public()
    @Post('refreshToken')
    refreshToken(@Body() loginDto:RefreshUserDto,@Req() req){
          const appId = req.headers['x-app-id']
          return this.userService.refreshToken({...loginDto,appId})
    }

    //查询用户详细信息
    @Get("getUserInfo")
    getUserInfo(@Req() req) {
        const userId = req.user.userId; 
        return this.userService.findOne(userId);
    }

   //查询用户列表
    @Roles(RoleEnum.ADMIN)
    @Get("user_list")
    getAllUser() {
        return this.userService.findAll()
    }

    //根据id查询用户信息
    @Get(":id")
    getUser(@Param('id', ParseIntPipe) id: number) {
        return this.userService.findOne(id)
    }
}
