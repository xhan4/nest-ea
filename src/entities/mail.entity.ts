import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Item } from './item.entity';
import { Character } from './character.entity';

export enum MailType {
  SYSTEM_AWARD = 'SYSTEM_AWARD',  
  SYTEM_NOTIFY= 'SYTEM_NOTIFY',
  TRADE_ITEM = 'TRADE_ITEM',
  TRADE_GOLD = 'TRADE_GOLD'
}
export enum REWARDTYPE{
   ITEM = 'ITEM',
   GOLD = 'GOLD',
}
@Entity("tb_mail")
export class Mail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: MailType, default: MailType.SYTEM_NOTIFY })
  mailType: MailType;

  @Column()
  subject: string;

  @Column({ type: 'text' })  // 改为text类型支持更长的内容
  content: string;

  @Column({ default: 1 })
  quantity: number;
   
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  goldAttachment: number;

  @Column({ type: 'json', nullable: true })
  rewards: Array<{
    type: REWARDTYPE;
    itemId?: number;
    amount: number;
  }>;

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: false })
  isClaimed: boolean;

  @Column({ type: 'timestamp' })
  sentAt: Date;

  @ManyToOne(() => Character, { nullable: true })
  recipient: Character;

  @ManyToOne(() => Item, { nullable: true })
  itemAttachment: Item;
}
