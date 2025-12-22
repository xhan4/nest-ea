import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity("tb_mail")
export class Mail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  subject: string;

  @Column({ type: 'text' })  //text类型支持更长的内容
  content: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'timestamp' })
  sentAt: Date;

  @ManyToOne(() => User, { nullable: true })
  recipient: User;
}
