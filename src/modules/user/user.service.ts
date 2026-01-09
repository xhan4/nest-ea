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
import { RoleEnum } from 'src/core/enums/roles.enum';
import { MembershipEnum } from 'src/core/enums/membership.enum';
import { PointsService } from '../points/points.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private pointsService: PointsService,
  ) {}

  async findOne(id: number): Promise<FindOneDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    return {
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      roles: user.roles,
      nickname: user.nickname,
      active: user.active,
      create_time: user.create_time,
      update_time: user.update_time,
      points: user.points,
      membership: user.membership,
    };
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: {
        id: true,
        username: true,
        avatar: true,
        roles: true,
        nickname: true,
        active: true,
        create_time: true,
        update_time: true,
        points: true,
        membership: true,
      },
    });
  }

  async registe(createUserDto: CreateUserDto) {
    const { username, password, appId } = createUserDto;
    const existUser = await this.userRepository.findOne({ where: { username } });
    if (existUser) {
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
    }
    try {
      const salt = creatSalt();
      const user = await this.userRepository.save({
        username,
        nickname: randomNickName(6),
        salt: salt,
        password: encryption(password, salt),
        appId,
        roles: [RoleEnum.USER], // 设置默认角色
        membership: MembershipEnum.NORMAL, // 设置默认会员等级为普通用户
        points: 0, // 初始积分为0，稍后通过积分服务添加
      });

      // 新用户注册赠送20积分
      await this.pointsService.addRegisterBonus(user.id);

      return {
        message: '注册成功',
        userId: user.id,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
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
    const payload = { 
      username: user.username, 
      id: user.id, 
      appId: user.appId,
      roles: user.roles // 添加roles信息
    };

    const userInfo = {
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      roles: user.roles,
      nickname: user.nickname,
      active: user.active,
      create_time: user.create_time,
      update_time: user.update_time,
    }
    const token = this.jwtService.sign(payload, { expiresIn: this.configService.get("JWT_EXP") });
    const refreshToken = this.jwtService.sign({ id: user.id }, { expiresIn: this.configService.get("JWT_REFRESH_EXP") })
    return { token, refreshToken,userInfo}
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

