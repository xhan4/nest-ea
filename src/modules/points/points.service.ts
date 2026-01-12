import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { PointsRecord, PointsTransactionType } from '../../entities/points-record.entity';
import { MembershipEnum } from '../../core/enums/membership.enum';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PointsRecord)
    private readonly pointsRecordRepository: Repository<PointsRecord>,
  ) {}

  // 获取用户当前积分
  async getUserPoints(userId: number): Promise<number> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }
    return user.points;
  }

  // 获取用户会员等级
  async getUserMembership(userId: number): Promise<MembershipEnum> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }
    return user.membership;
  }

  // 根据会员等级获取视频生成所需积分
  getVideoPointsCost(membership: MembershipEnum): number {
    switch (membership) {
      case MembershipEnum.NORMAL:
        return 15;  // 普通用户15积分
      case MembershipEnum.REGULAR:
        return 10;  // 普通会员10积分
      case MembershipEnum.PREMIUM:
        return 5;   // 高级会员5积分
      case MembershipEnum.LIFETIME:
        return 3;   // 终身会员3积分
      default:
        return 15;  // 默认普通用户积分
    }
  }
  // 增加积分
  async addPoints(
    userId: number, 
    points: number, 
    transactionType: PointsTransactionType,
    description?: string,
    relatedId?: string
  ): Promise<PointsRecord> {
    if (points <= 0) {
      throw new HttpException('积分必须大于0', HttpStatus.BAD_REQUEST);
    }

    return await this.userRepository.manager.transaction(async (manager) => {
      // 获取用户当前积分
      const user = await manager.findOne(User, { where: { id: userId } });
      if (!user) {
        throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
      }

      // 更新用户积分
      const newPoints = user.points + points;
      await manager.update(User, userId, { points: newPoints });

      // 创建积分记录
      const record = manager.create(PointsRecord, {
        user: { id: userId },
        points,
        balance: newPoints,
        transactionType,
        description,
        relatedId,
      });

      return await manager.save(record);
    });
  }

  // 扣除积分
  async deductPoints(
    userId: number, 
    points: number, 
    transactionType: PointsTransactionType,
    description?: string,
    relatedId?: string
  ): Promise<PointsRecord> {
    if (points <= 0) {
      throw new HttpException('积分必须大于0', HttpStatus.BAD_REQUEST);
    }

    return await this.userRepository.manager.transaction(async (manager) => {
      // 获取用户当前积分
      const user = await manager.findOne(User, { where: { id: userId } });
      if (!user) {
        throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
      }

      // 检查积分是否足够
      if (user.points < points) {
        throw new HttpException('积分不足', HttpStatus.BAD_REQUEST);
      }

      // 更新用户积分
      const newPoints = user.points - points;
      await manager.update(User, userId, { points: newPoints });

      // 创建积分记录
      const record = manager.create(PointsRecord, {
        user: { id: userId },
        points: -points,  // 负数表示扣除
        balance: newPoints,
        transactionType,
        description,
        relatedId,
      });

      return await manager.save(record);
    });
  }

  // 获取用户积分记录
  async getUserPointsHistory(userId: number, page: number = 1, limit: number = 10): Promise<{ records: PointsRecord[], total: number }> {
    const [records, total] = await this.pointsRecordRepository.findAndCount({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { records, total };
  }

  // 新用户注册赠送积分
  async addRegisterBonus(userId: number): Promise<PointsRecord> {
    return this.addPoints(
      userId,
      20,  // 新用户赠送20积分
      PointsTransactionType.REGISTER_BONUS,
      '新用户注册赠送积分'
    );
  }

 // 更新积分记录的relatedId
  async updatePointsRecordRelatedId(recordId: number, relatedId: string): Promise<PointsRecord> {
    const record = await this.pointsRecordRepository.findOne({ where: { id: recordId } });
    if (!record) {
      throw new HttpException('积分记录不存在', HttpStatus.NOT_FOUND);
    }

    record.relatedId = relatedId;
    return await this.pointsRecordRepository.save(record);
  }

  // 检查是否已经为某个视频ID返还过积分
  async hasRefundedForVideo(userId: number, videoId: string): Promise<boolean> {
    const refundRecord = await this.pointsRecordRepository.findOne({
      where: {
        user: { id: userId },
        relatedId: videoId,
        transactionType: PointsTransactionType.VIDEO_REFUND
      }
    });
    return !!refundRecord;
  }
}