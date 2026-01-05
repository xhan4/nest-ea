import { Controller, Post, Get, Body, Param, HttpStatus, HttpException } from '@nestjs/common';
import { Sora2Service } from './sora2.service';
import { CreateVideoDto } from './dto/create-video.dto';

@Controller('video-ai')
export class Sora2Controller {
  constructor(private readonly sora2Service: Sora2Service) {}

  // 创建视频任务接口
  @Post('videos')
  async createVideo(@Body() createVideoDto: CreateVideoDto): Promise<any> {
    try {
      const response = await this.sora2Service.createVideo(createVideoDto);
      console.log('createVideo response:', response);
      // 直接返回业务数据，让拦截器包装
      return {
        id: response.id
      };
    } catch (error) {
      // 抛出异常，让异常过滤器处理
      throw error;
    }
  }

  // 查询视频结果接口（包含进度和最终结果）
  @Get('videos/:id/result')
  async getVideoResult(@Param('id') id: string): Promise<any> {
    try {
      const result = await this.sora2Service.getVideoStatus(id);
      
      // 直接返回业务数据
      return {
        id: result.id,
        progress: result.progress || 0,
        status: result.status || 'running',
        results: result.results || null,
        failure_reason: result.failure_reason || '',
        error: result.error || ''
      };
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        // 任务不存在的情况，抛出特定异常
        throw new HttpException('任务不存在', HttpStatus.NOT_FOUND);
      }
      throw error;
    }
  }
}