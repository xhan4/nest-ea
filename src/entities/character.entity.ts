import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Sect } from "./sect.entity";
import { SectMember } from "./sect-member.entity";

@Entity("tb_character")
export class Character {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, user => user.character)
  user: User;

  @Column({ length: 50 })
  name: string;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  experience: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // 角色属性
  @Column({ default: 10 })
  strength: number;

  @Column({ default: 10 })
  agility: number;

  @Column({ default: 10 })
  intelligence: number;

  @Column({ default: 10 })
  vitality: number;

  @OneToOne(() => Sect, sect => sect.founder)
  foundedSect: Sect;

  @OneToMany(() => SectMember, member => member.character)
  sectMembers: SectMember[];

  @Column({ default: 60 })
  maxLifespan: number;

  @Column({ default: 18 })
  age: number; 

  @Column({ type: 'timestamp', nullable: true })
  lastAgingTime: Date;
}
