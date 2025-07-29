import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Character } from "./character.entity";
import { SectMember } from "./sect-member.entity";
import { SpiritualField } from "./spiritual-field.entity";
import { Inventory } from "./inventory.entity";

@Entity("tb_sect")
export class Sect {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 1 })
  level: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ default: 30 })
  maxMembers: number;

  @Column({ nullable: true })
  banner: string;

  @OneToMany(() => SectMember, member => member.sect)
  members: SectMember[];

  @OneToMany(() => SpiritualField, field => field.sect)
  spiritualFields: SpiritualField[];

  @OneToMany(() => Inventory, inventory => inventory.sect)
  inventories: Inventory[];
  
  @OneToOne(() => Character, character => character.sect)
  @JoinColumn()
  founder: Character;
}
