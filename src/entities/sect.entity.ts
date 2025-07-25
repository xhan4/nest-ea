import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Character } from "./character.entity";
import { SectMember } from "./sect-member.entity";
import { Village } from "./village.entity";
import { SpiritualField } from "./spiritual-field.entity";

@Entity("tb_sect")
export class Sect {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Character, character => character.foundedSect)
  founder: Character;

  @Column({ length: 100 })
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

  @OneToMany(() => SectMember, member => member.sect)
  members: SectMember[];

  @OneToMany(() => Village, village => village.sect)
  villages: Village[];

  @OneToMany(() => SpiritualField, field => field.sect)
  spiritualFields: SpiritualField[];
}
