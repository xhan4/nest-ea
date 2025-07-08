import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Item } from './item.entity';

export enum MailType {
  SYSTEM_AWARD = 'SYSTEM_AWARD',  
  SYTEM_NOTIFY= 'SYTEM_NOTIFY',
  TRADE_ITEM = 'TRADE_ITEM',
  TRADE_GOLD = 'TRADE_GOLD'
}
@Entity("tb_mail")
export class Mail {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: true })
  recipient: User;

  @Column({ type: 'enum', enum: MailType, default: MailType.SYTEM_NOTIFY })
  mailType: MailType;

  @Column()
  subject: string;

  @Column({ type: 'text' })  // 改为text类型支持更长的内容
  content: string;

  @Column()
  quantity: number;
   
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
