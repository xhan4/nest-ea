import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { CreateVideoDto } from './dto/create-video.dto';
import { VideoResponseDto } from './dto/video-response.dto';
import { ApiResponseDto } from './dto/api-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { PointsService } from '../points/points.service';
import { VideoRecordService } from '../video-record/video-record.service';
import { PointsTransactionType } from '../../entities/points-record.entity';

@Injectable()
export class Sora2Service {
  private readonly logger = new Logger(Sora2Service.name);
  private readonly baseUrl = 'https://grsai.dakka.com.cn';
  private readonly apiKey = process.env.SORA2_API_KEY;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly pointsService: PointsService,
    private readonly videoRecordService: VideoRecordService,
  ) {}

  // 创建视频任务（立即返回任务ID）
  async createVideo(createVideoDto: CreateVideoDto, userId?: number): Promise<VideoResponseDto> {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      };

      // 设置webHook为"-1"立即返回任务ID
      const requestBody = { ...createVideoDto, webHook: "-1" };
      const response: AxiosResponse<ApiResponseDto<VideoResponseDto>> = await axios.post(
        `${this.baseUrl}/v1/video/sora-video`,
        requestBody,
        { headers }
      );
      const data = response.data;
      if (data.code !== 0) {
        throw new HttpException(
          data.msg || '视频生成失败',
          data.code || HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      // 如果提供了userId，则处理积分和记录
      if (userId) {
        // 获取用户信息
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
          throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
        }

        // 获取用户会员等级和所需积分
        const membership = user.membership;
        const pointsCost = this.pointsService.getVideoPointsCost(membership);

        // 检查用户积分是否足够
        const userPoints = await this.pointsService.getUserPoints(userId);
        if (userPoints < pointsCost) {
          throw new HttpException('积分不足', HttpStatus.BAD_REQUEST);
        }

        // 扣除积分
        const pointsRecord = await this.pointsService.deductPoints(
          userId,
          pointsCost,
          PointsTransactionType.VIDEO_DEDUCTION,
          '视频生成扣费',
          data.data.id
        );

        // 创建视频记录
        await this.videoRecordService.createVideoRecord(
          userId,
          data.data.id,
          pointsCost,
          requestBody
        );
      }

      return data.data;
    } catch (error) {
      // 如果是积分不足错误，直接抛出
      if (error.message === '积分不足') {
        throw error;
      }

      // 如果提供了userId且不是用户不存在的错误，尝试返还积分
      if (userId && error.message !== '用户不存在') {
        try {
          const user = await this.userRepository.findOne({ where: { id: userId } });
          if (user) {
            const pointsCost = this.pointsService.getVideoPointsCost(user.membership);
            await this.pointsService.addPoints(
              userId,
              pointsCost,
              PointsTransactionType.VIDEO_REFUND,
              `视频生成失败返还积分 - ${error.response?.data?.msg || error.message || '视频生成失败'}`,
              null
            );
          }
        } catch (pointsError) {
          this.logger.error('返还积分失败', pointsError);
        }
      }

      if (error.response) {
        throw new HttpException(
          error.response.data.msg || '视频生成失败',
          error.response.status || HttpStatus.INTERNAL_SERVER_ERROR
        );
      } else if (error.request) {
        throw new HttpException('网络连接错误', HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw new HttpException('请求配置错误', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // 查询视频状态和结果
  async getVideoStatus(id: string): Promise<VideoResponseDto> {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      };

      const requestBody = {
        id: id
      };
      const response: AxiosResponse<ApiResponseDto<VideoResponseDto>> = await axios.post(
        `${this.baseUrl}/v1/draw/result`,
        requestBody,
        { headers }
      );
      const data = response.data;
      // 检查API返回的状态码
      if (data.code !== 0) {
        if (data.code === -22) {
          throw new HttpException('任务不存在', HttpStatus.NOT_FOUND);
        }
        
        // 获取视频记录
        const videoRecord = await this.videoRecordService.getVideoRecordByVideoId(id);
        if (videoRecord) {
          // 更新视频记录为失败状态
          await this.videoRecordService.updateVideoRecordFailed(
            id,
            data.msg || '获取视频状态失败',
            data
          );
        }
        
        throw new HttpException(
          data.msg || '获取视频状态失败',
          data.code || HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      // 获取视频记录
      const videoRecord = await this.videoRecordService.getVideoRecordByVideoId(id);
      if (videoRecord) {
        // 根据API返回的状态更新视频记录
        if (data.data.status === 'succeeded' && data.data.results && data.data.results.length > 0) {
          // 视频生成成功
          const videoUrl = data.data.results[0].url;
          await this.videoRecordService.updateVideoRecordSuccess(
            id,
            videoUrl,
            data
          );
        } else if (data.data.status === 'failed') {
          // 视频生成失败
          await this.videoRecordService.updateVideoRecordFailed(
            id,
            data.data.failure_reason || data.data.error || '视频生成失败',
            data
          );
        }
        // 如果状态是其他值（如处理中），则不更新记录状态
      }

      return data.data;
    } catch (error) {
      if (error.response) {
        // 如果已经是HttpException，直接抛出
        if (error instanceof HttpException) {
          throw error;
        }
        
        // 获取视频记录
        const videoRecord = await this.videoRecordService.getVideoRecordByVideoId(id);
        if (videoRecord) {
          // 更新视频记录为失败状态
          await this.videoRecordService.updateVideoRecordFailed(
            id,
            error.response.data.msg || '获取视频状态失败',
            error.response.data
          );
        }
        
        throw new HttpException(
          error.response.data.msg || '获取视频状态失败',
          error.response.status || HttpStatus.INTERNAL_SERVER_ERROR
        );
      } else if (error.request) {
        throw new HttpException('网络连接错误', HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw new HttpException('请求配置错误', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}