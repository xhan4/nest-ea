import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import encryption from 'src/utils/crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository:Repository<User>,
        private jwtService:JwtService,
    ){}
   findOne(id:number):Promise<User>{
    return this.userRepository.findOneBy({id});
   }
   findAll():Promise<User[]>{
     return this.userRepository.find()
   }
   async create(createUserDto:CreateUserDto){
    const {username,password} = createUserDto;
    const existUser = await this.userRepository.findOne({where:{username}});
    if(existUser){
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
    }
    try{
      const newUser = new User();
      newUser.username = username;
      newUser.password = password;
      await this.userRepository.save(newUser);
      return '注册成功';
    }catch(error){
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
   }
   async login(loginDto: CreateUserDto) {
    const { username, password } = loginDto;
    const user = await this.userRepository.findOne({where:{username}});
    if(!user){
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    if (user.password !== encryption(password, user.salt)) {
      throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
    }
    const payload = { username: user.username, sub: user.id };
    return await this.jwtService.signAsync(payload);
  }
}

