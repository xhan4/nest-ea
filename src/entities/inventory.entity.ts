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
}
