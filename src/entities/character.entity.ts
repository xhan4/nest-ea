import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Sect } from "./sect.entity";
import { SectMember } from "./sect-member.entity";
import { GenderEnum } from "src/core/enums/gender.enum";
import { Trade } from "./trade.entity";
import { Mail } from "./mail.entity";
import { Transaction } from "./transaction.entity";
import { Inventory } from "./inventory.entity";
@Entity("tb_character")
export class Character {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

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

  @OneToOne(() => User, user => user.character)
  @JoinColumn()
  user: User;

  @OneToOne(() => Sect, sect => sect.founder)
  foundedSect: Sect;
  
  @OneToMany(() => Trade, trade => trade.seller)
  sellTrades: Trade[];

  @OneToMany(() => Transaction, transaction => transaction.buyer)
  buyTrades: Trade[];

  @OneToMany(() => Mail, mail => mail.recipient)
  receivedMails: Mail[];

  @OneToMany(() => SectMember, member => member.character)
  sectMembers: SectMember[];

  @OneToOne(() => Inventory, inventory => inventory.character)
  inventory: Inventory;
}
