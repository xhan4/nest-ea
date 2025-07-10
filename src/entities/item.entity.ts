import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
@Entity("tb_item")
export class Item {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    type: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    price: number;

    @Column()
    desc: string;
}
