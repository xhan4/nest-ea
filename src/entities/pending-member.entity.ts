import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Sect } from "./sect.entity";
import { GenderEnum } from "src/core/enums/gender.enum";
import { Character } from "./character.entity";

@Entity("tb_pending_member")
export class PendMember {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    type: 'enum',
    enum: ['LEADER', 'ELDER', 'DISCIPLE', 'INNER', 'OUTER'],
    default: 'DISCIPLE'
  })
  rank: string;
  
  @Column()
  name: string;

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

  @Column({ type: 'timestamp' })
  arriveTime: Date;

  @Column({ default: 24 })
  expireHours: number;

  
  @ManyToOne(() => Sect)
  sect: Sect;

  @ManyToOne(() => Character, character => character.sectMembers)
  character: Character;

}
