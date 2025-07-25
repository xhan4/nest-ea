import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Sect } from "./sect.entity";
import { Character } from "./character.entity";

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

  @Column({ default: 0 })
  contribution: number;
}
