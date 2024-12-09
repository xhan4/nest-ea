import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
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
    login(@Body() loginDto:CreateUserDto){
         this.userService.login(loginDto)
    }

    //根据id查询用户信息
    @Get("/user/:id")
    getUser(@Param('id', ParseIntPipe) id: number) {
        return this.userService.findOne(id)
    }
    //查询用户列表
    @Get("/user_list")
    getAllUser() {
        return this.userService.findAll()
    }

}
