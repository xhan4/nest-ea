import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne } from 'typeorm';
import { Item } from './item.entity';
import { Sect } from './sect.entity';
import { Character } from './character.entity';

@Entity("tb_inventory")
export class Inventory {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Item)
    item: Item;

    @Column()
    count: number;

    @ManyToOne(() => Character, character => character.inventories)
    character: Character;

    @ManyToOne(() => Sect, sect => sect.inventories)
    sect: Sect;
}
