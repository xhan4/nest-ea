import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { CreateVideoDto } from './dto/create-video.dto';
import { VideoResponseDto } from './dto/video-response.dto';
import { ApiResponseDto } from './dto/api-response.dto';

@Injectable()
export class Sora2Service {
  private readonly logger = new Logger(Sora2Service.name);
  private readonly baseUrl = 'https://grsai.dakka.com.cn';
  private readonly apiKey = process.env.SORA2_API_KEY;

  // 创建视频任务（立即返回任务ID）
  async createVideo(createVideoDto: CreateVideoDto): Promise<VideoResponseDto> {
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

      return data.data;
    } catch (error) {
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
        throw new HttpException(
          data.msg || '获取视频状态失败',
          data.code || HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      return data.data;
    } catch (error) {
      if (error.response) {
        // 如果已经是HttpException，直接抛出
        if (error instanceof HttpException) {
          throw error;
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