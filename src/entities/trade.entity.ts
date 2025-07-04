import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Item } from "./item.entity";
import { TradeStatus } from './trade-status.enum';

@Entity("tb_trade")
export class Trade {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    seller: User;

    @ManyToOne(() => User)
    buyer: User;

    @ManyToOne(() => Item)
    item: Item;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ type: 'enum', enum: TradeStatus })
    status: TradeStatus;

    @Column({ type: 'timestamp', nullable: true })
    completedAt: Date;
}
