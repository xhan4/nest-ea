import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Item } from './item.entity';
import { Trade } from './trade.entity';

@Entity("tb_transaction")
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  buyer: User;

  @ManyToOne(() => User)
  seller: User;

  @ManyToOne(() => Item)
  item: Item;

  @ManyToOne(() => Trade)
  trade: Trade;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  sellerEarnings: number;

  @Column({ type: 'timestamp' })
  transactionTime: Date;

  @Column({ default: false })
  buyerClaimed: boolean; 

  @Column({ default: false })
  sellerClaimed: boolean;
}
