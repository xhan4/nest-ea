import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

export enum VideoStatus {
  PENDING = 'pending',    // 处理中
  SUCCESS = 'success',    // 成功
  FAILED = 'failed',      // 失败
}

@Entity("tb_video_record")
export class VideoRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @Column({ type: 'varchar', length: 100 })
  videoId: string;  // 视频ID

  @Column({ type: 'text', nullable: true })
  videoUrl: string;  // 视频URL

  @Column({ type: 'enum', enum: VideoStatus, default: VideoStatus.PENDING })
  status: VideoStatus;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;  // 错误信息

  @Column({ type: 'int' })
  pointsDeducted: number;  // 扣除的积分

  @Column({ type: 'json', nullable: true })
  requestParams: any;  // 请求参数

  @Column({ type: 'json', nullable: true })
  responseResult: any;  // 响应结果

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;
}