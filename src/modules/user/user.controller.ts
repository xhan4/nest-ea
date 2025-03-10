import { Body, Controller, Get, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshUserDto } from './dto/refresh-user.dto';
import { Public } from '../public.decorator';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }
    //注册用户
    @Public()
    @Post('register')
    create(@Body() createUserDto: CreateUserDto) {

        return this.userService.create(createUserDto);
    }
    //登录用户
    @Public()
    @Post('login')
    login(@Body() loginDto:LoginUserDto){
        return this.userService.login(loginDto)
    }
    
    //刷新token
    @Public()
    @Post('refreshToken')
    refreshToken(@Body() loginDto:RefreshUserDto){
          return this.userService.refreshToken(loginDto)
    }

    //查询用户详细信息
    @Get("/getUserInfo")
    getUserInfo(@Req() req) {
        const userId = req.user.userId; 
        return this.userService.findOne(userId);
    }

    //根据id查询用户信息
    @Get("/:id")
    getUser(@Param('id', ParseIntPipe) id: number) {
        return this.userService.findOne(id)
    }
    //查询用户列表
    @Get("/user_list")
    getAllUser() {
        return this.userService.findAll()
    }

}
