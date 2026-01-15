import { Controller, Post, Get, Body, Param, HttpStatus, HttpException, Req } from '@nestjs/common';
import { Sora2Service } from './sora2.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Controller('video-ai')
export class Sora2Controller {
  constructor(
    private readonly sora2Service: Sora2Service,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  
  @Post('videos')
  async createVideo(@Body() createVideoDto: CreateVideoDto, @Req() req: Request) {
    // 从请求头中获取token
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new HttpException('未提供认证令牌', HttpStatus.UNAUTHORIZED);
    }
    
    // 验证token并获取用户ID
    const payload = this.jwtService.verify(token, {
      secret: this.configService.get('JWT_SECRET'),
    });
    
    const userId = payload.id; 
    
    // 调用服务创建视频
    return this.sora2Service.createVideo(createVideoDto, userId);
  }

  @Get('videos/:id/result')
  async getVideoResult(@Param('id') videoId: string) {
    return this.sora2Service.getVideoStatus(videoId);
  }
}