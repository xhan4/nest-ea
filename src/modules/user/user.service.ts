import { HttpException, HttpStatus, Injectable, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { encryption, creatSalt, randomNickName } from 'src/utils';
import { JwtService } from '@nestjs/jwt';
import { RefreshUserDto } from './dto/refresh-user.dto';
import { ConfigService } from '@nestjs/config';
import { FindOneDto } from './dto/find-one.dto';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }
  async findOne(id: number): Promise<FindOneDto> {
    const user = await this.userRepository.findOneBy({ id });
    return {
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      role: user.role,
      nickname: user.nickname,
      active: user.active,
      create_time: user.create_time,
      update_time: user.update_time,
      balance: user.balance,
    }
  }
  findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: {
        id: true,
        username: true,
        avatar: true,
        role: true,
        nickname: true,
        active: true,
        create_time: true,
        update_time: true,
        balance: true,
      }
    })
  }
  async registe(createUserDto: CreateUserDto) {
    const { username, password, appId } = createUserDto;
    const existUser = await this.userRepository.findOne({ where: { username } });
    if (existUser) {
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
    }
    try {
      const salt = creatSalt()
      await this.userRepository.save({
        username,
        nickname: randomNickName(6),
        salt: salt,
        password: encryption(password, salt),
        appId
      });
      return '注册成功';
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async login(loginDto: LoginUserDto) {
    const { username, password, appId } = loginDto;
    const user = await this.userRepository.findOne({
      where: [
        { username: username },
        { nickname: username }
      ]
    });

    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    if (user.password !== encryption(password, user.salt)) {
      throw new HttpException('用户名或密码错误', HttpStatus.BAD_REQUEST);
    }
    if (user.appId !== appId) {
      throw new HttpException('无权访问该应用', HttpStatus.FORBIDDEN);
    }
    const payload = { username: user.username, id: user.id, appId: user.appId };
    const token = this.jwtService.sign(payload, { expiresIn: this.configService.get("JWT_EXP") });
    const refreshToken = this.jwtService.sign({ id: user.id }, { expiresIn: this.configService.get("JWT_REFRESH_EXP") })
    return { token, refreshToken }
  }

  // 刷新token
  async refreshToken(refreshDto: RefreshUserDto) {
    const { refresh_token, appId } = refreshDto;
    try {
      const decoded = this.jwtService.verify(refresh_token);
      const user = await this.userRepository.findOne({
        where: {
          id: decoded.id,
        },
      });
      if (user.appId !== appId) {
        throw new HttpException('无权访问该应用', HttpStatus.FORBIDDEN);
      }
      const token = this.jwtService.sign(
        {
          username: user.username,
          id: decoded.id,
        },
        {
          expiresIn: this.configService.get("JWT_EXP"),
        },
      );
      const newRefreshToken = this.jwtService.sign(
        {
          id: decoded.id,
        },
        {
          expiresIn: this.configService.get("JWT_REFRESH_EXP"),
        },
      );

      return { refreshToken: newRefreshToken, token };
    } catch (error) {
      throw new HttpException('refresh_token已过期', HttpStatus.BAD_REQUEST);
    }
  }
}

