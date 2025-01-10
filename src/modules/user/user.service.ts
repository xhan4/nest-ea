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
    const user = await this.userRepository.findOne({where: [
      { username: username },
      { nickname: username }
  ]});
    
    if(!user){
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    if (user.password !== encryption(password, user.salt)) {
      throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
    }
    const payload = { username: user.username, id: user.id };
    const token = this.jwtService.sign(payload,{expiresIn:'2h'});
    const refreshToken = this.jwtService.sign({id: user.id},{expiresIn:'7d'})
    return {token,refreshToken}
  }

   // 刷新token
   async refreshToken(refresh_token: string) {
    try {
      // 验证refresh_token
      const decoded = this.jwtService.verify(refresh_token);

      // 获取用户信息
      const user = await this.userRepository.findOne({
        where: {
          id: decoded.id,
        },
      });

      // 生成access_token
      const token = this.jwtService.sign(
        {
          username: user.username,
          id: decoded.id,
        },
        {
          expiresIn: '2h', // 30分钟
        },
      );

      // 生成refresh_token
      const newRefreshToken = this.jwtService.sign(
        {
          id: decoded.id,
        },
        {
          expiresIn: '7d', // 7天
        },
      );

      return { data: { refreshToken: newRefreshToken, token } };
    } catch (error) {
      throw new HttpException('refresh_token已过期', HttpStatus.BAD_REQUEST);
    }
  }
}

