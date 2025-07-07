import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
@Entity("tb_item")
export class Item {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    type: string;

    @Column({ default: false })
    isTrading: boolean;
        
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    price: number;

    @Column({ type: 'timestamp', nullable: true })
    lastTradeTime: Date;
}
