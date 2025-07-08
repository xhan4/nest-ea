import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Item } from './item.entity';

export enum MailType {
  SYSTEM = 'SYSTEM',  // 新增系统邮件类型
  PERSONAL = 'PERSONAL'
}

// 确保枚举被导出
export enum MailAttachmentType {
  ITEM = 'ITEM',
  GOLD = 'GOLD'
}

@Entity("tb_mail")
export class Mail {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: true })
  recipient: User;

  @Column({ type: 'enum', enum: MailType, default: MailType.PERSONAL })
  mailType: MailType;

  @Column()
  subject: string;

  @Column({ type: 'text' })  // 改为text类型支持更长的内容
  content: string;

  @Column({ type: 'enum', enum: MailAttachmentType, nullable: true })
  attachmentType: MailAttachmentType;

  @ManyToOne(() => Item, { nullable: true })
  itemAttachment: Item;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  goldAttachment: number;

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: false })
  isClaimed: boolean;

  @Column({ type: 'timestamp' })
  sentAt: Date;
}
