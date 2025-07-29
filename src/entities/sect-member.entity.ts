import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Sect } from "./sect.entity";
import { Character } from "./character.entity";
import { GenderEnum } from "src/core/enums/gender.enum";

@Entity("tb_sect_member")
@Unique(['sect', 'character'])
export class SectMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Sect, sect => sect.members)
  sect: Sect;

  @ManyToOne(() => Character, character => character.sectMembers)
  character: Character;

  @Column({
    type: 'enum',
    enum: ['LEADER', 'ELDER', 'DISCIPLE', 'INNER', 'OUTER'],
    default: 'DISCIPLE'
  })
  rank: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  joined_at: Date;

  @Column({ default: 60 })
  maxLifespan: number;

  @Column({ default: 18 })
  age: number;

  @Column({ type: 'timestamp', nullable: true })
  lastAgingTime: Date;

  @Column({
    type: 'enum',
    enum: GenderEnum,
    default: GenderEnum.MALE
  })
  gender: GenderEnum;

  @Column({
    type: 'int',
    default: 50,
    comment: '范围1-100'
  })
  comprehension: number;

  @Column({
    type: 'json',
    nullable: true,
  })
  spiritRoots: string[];
}
