import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Character } from "./character.entity";
import { SectMember } from "./sect-member.entity";
import { SpiritualField } from "./spiritual-field.entity";
import { Inventory } from "./inventory.entity";

@Entity("tb_sect")
export class Sect {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Character, character => character.foundedSect)
  @JoinColumn()
  founder: Character;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  reputation: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ default: 1000 })
  funds: number;

  @Column({ default: 50 })
  maxMembers: number;

  @Column({ nullable: true })
  banner: string;

  @OneToMany(() => SectMember, member => member.sect)
  members: SectMember[];

  @OneToMany(() => SpiritualField, field => field.sect)
  spiritualFields: SpiritualField[];

  @OneToOne(() => Inventory, inventory => inventory.sect)
  inventory: Inventory[];

  @OneToOne(() => Character)
  @JoinColumn()
  leader: Character; 
}
