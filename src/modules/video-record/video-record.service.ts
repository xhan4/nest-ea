import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoRecord, VideoStatus } from '../../entities/video-record.entity';
import { User } from '../../entities/user.entity';
import { PointsService } from '../points/points.service';
import { PointsTransactionType } from '../../entities/points-record.entity';

@Injectable()
export class VideoRecordService {
  constructor(
    @InjectRepository(VideoRecord)
    private readonly videoRecordRepository: Repository<VideoRecord>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly pointsService: PointsService,
  ) {}

  // 创建视频记录
  async createVideoRecord(
    userId: number,
    videoId: string,
    pointsDeducted: number,
    requestParams: any
  ): Promise<VideoRecord> {
    // 检查用户是否存在
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }

    // 创建视频记录
    const videoRecord = this.videoRecordRepository.create({
      user: { id: userId },
      videoId,
      pointsDeducted,
      requestParams,
      status: VideoStatus.PENDING,
    });

    return await this.videoRecordRepository.save(videoRecord);
  }

  // 更新视频记录为成功状态
  async updateVideoRecordSuccess(
    videoId: string,
    videoUrl: string,
    responseResult: any
  ): Promise<VideoRecord> {
    const videoRecord = await this.videoRecordRepository.findOne({
      where: { videoId },
      relations: ['user'],
    });

    if (!videoRecord) {
      throw new HttpException('视频记录不存在', HttpStatus.NOT_FOUND);
    }

    videoRecord.status = VideoStatus.SUCCESS;
    videoRecord.videoUrl = videoUrl;
    videoRecord.responseResult = responseResult;
    videoRecord.completedAt = new Date();

    return await this.videoRecordRepository.save(videoRecord);
  }

  // 更新视频记录为失败状态并返还积分
  async updateVideoRecordFailed(
    videoId: string,
    errorMessage: string,
    responseResult: any
  ): Promise<VideoRecord> {
    const videoRecord = await this.videoRecordRepository.findOne({
      where: { videoId },
      relations: ['user'],
    });

    if (!videoRecord) {
      throw new HttpException('视频记录不存在', HttpStatus.NOT_FOUND);
    }

    videoRecord.status = VideoStatus.FAILED;
    videoRecord.errorMessage = errorMessage;
    videoRecord.responseResult = responseResult;
    videoRecord.completedAt = new Date();

    // 检查是否已经返还过积分，如果没有则返还
    if (videoRecord.pointsDeducted > 0) {
      const hasRefunded = await this.pointsService.hasRefundedForVideo(
        videoRecord.user.id,
        videoId
      );
      
      if (!hasRefunded) {
        await this.pointsService.addPoints(
          videoRecord.user.id,
          videoRecord.pointsDeducted,
          PointsTransactionType.VIDEO_REFUND,
          `视频生成失败返还积分 - ${errorMessage}`,
          videoId
        );
      }
    }

    return await this.videoRecordRepository.save(videoRecord);
  }

  // 获取用户的视频记录
  async getUserVideoRecords(userId: number, page: number = 1, limit: number = 10): Promise<{ records: VideoRecord[], total: number }> {
    const [records, total] = await this.videoRecordRepository.findAndCount({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { records, total };
  }

  // 根据视频ID获取视频记录
  async getVideoRecordByVideoId(videoId: string): Promise<VideoRecord> {
    return await this.videoRecordRepository.findOne({
      where: { videoId },
      relations: ['user'],
    });
  }
  async getAllUsersVideoRecords(
    page: number = 1,
    limit: number = 10,
    username?: string,
    nickname?: string,
    startDate?: Date,
    endDate?: Date,
    status?: VideoStatus
  ): Promise<{ records: (Omit<VideoRecord, 'user'> & { username: string, nickname: string })[], total: number }> {
    // 构建查询条件
    const whereCondition: any = {};
    
    if (username) {
      whereCondition.user = { ...whereCondition.user, username: username };
    }
    
    if (nickname) {
      whereCondition.user = { ...whereCondition.user, nickname: nickname };
    }
    
    if (status) {
      whereCondition.status = status;
    }
    
    // 处理日期范围
    let dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter = {};
      if (startDate) {
        dateFilter.createdAt = { ...dateFilter.createdAt, gte: startDate };
      }
      if (endDate) {
        // 将结束日期设置为当天的23:59:59
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        dateFilter.createdAt = { ...dateFilter.createdAt, lte: endOfDay };
      }
    }
    
    // 合并查询条件
    const finalWhereCondition = Object.keys(dateFilter).length > 0 
      ? { ...whereCondition, ...dateFilter }
      : whereCondition;
    
    // 查询视频记录
    const [records, total] = await this.videoRecordRepository.findAndCount({
      where: finalWhereCondition,
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    
    // 转换数据格式，移除user对象，添加userAccount和userNickname字段
    const formattedRecords = records.map(record => {
      const { user, ...recordWithoutUser } = record;
      return {
        ...recordWithoutUser,
        username: user.username,
        nickname: user.nickname,
      };
    });
    
    return { records: formattedRecords, total };
  }
}