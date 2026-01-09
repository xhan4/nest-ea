import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

export enum PointsTransactionType {
  REGISTER_BONUS = 'register_bonus',    // 注册赠送
  VIDEO_DEDUCTION = 'video_deduction',  // 视频生成扣费
  VIDEO_REFUND = 'video_refund',        // 视频生成失败返还
  MANUAL_ADD = 'manual_add',           // 手动增加
  MANUAL_DEDUCT = 'manual_deduct',      // 手动扣除
}

@Entity("tb_points_record")
export class PointsRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @Column({ type: 'int', default: 0 })
  points: number;  // 积分变化量，正数为增加，负数为扣除

  @Column({ type: 'int', default: 0 })
  balance: number;  // 操作后的余额

  @Column({ type: 'enum', enum: PointsTransactionType })
  transactionType: PointsTransactionType;

  @Column({ type: 'text', nullable: true })
  description: string;  // 描述

  @Column({ type: 'varchar', length: 50, nullable: true })
  relatedId: string;  // 关联ID，如视频ID

  @CreateDateColumn()
  createdAt: Date;
}