import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Item } from './item.entity';

export enum MailAttachmentType {
  ITEM = 'ITEM',
  GOLD = 'GOLD',
}

@Entity("tb_mail")
export class Mail {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  recipient: User;

  @Column()
  subject: string;

  @Column()
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
  isAttachmentClaimed: boolean;

  @Column({ type: 'timestamp' })
  sentAt: Date;
}
