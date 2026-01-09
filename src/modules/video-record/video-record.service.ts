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

    // 返还积分
    if (videoRecord.pointsDeducted > 0) {
      await this.pointsService.addPoints(
        videoRecord.user.id,
        videoRecord.pointsDeducted,
        PointsTransactionType.VIDEO_REFUND,
        `视频生成失败返还积分 - ${errorMessage}`,
        videoId
      );
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
}