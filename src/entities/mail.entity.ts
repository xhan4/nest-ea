import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Character } from './character.entity';
import { ItemType } from 'src/core/enums/item-type.enum';

@Entity("tb_mail")
export class Mail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  subject: string;

  @Column({ type: 'text' })  //text类型支持更长的内容
  content: string;

  @Column({ default: 1 })
  quantity: number;
   
  @Column({ type: 'json', nullable: true })
  rewards: Array<{
    type: ItemType;
    itemId: number;
    itemName: string;
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
}
