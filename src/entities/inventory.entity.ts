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

    @OneToOne(() => Character, character => character.inventory)
    character: Character;

    @OneToOne(() => Sect, sect => sect.inventory)
    sect: Sect;
}
