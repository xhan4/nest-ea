import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Item } from './item.entity';

@Entity("tb_inventory")
export class Inventory {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.inventoryItems)
    user: User;

    @ManyToOne(() => Item)
    item: Item;

    @Column()
    count: number;

    @Column({ default: false })
    isTrading: boolean;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    price: number;

    @Column({ type: 'timestamp', nullable: true })
    lastTradeTime: Date;

    @Column({ default: 0 })
    tradingCount: number; // 新增字段，记录正在交易中的数量
}
