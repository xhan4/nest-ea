import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Trade } from "./trade.entity";
import { Inventory } from "./inventory.entity";
import { Mail } from "./mail.entity";
import { Transaction } from "./transaction.entity";
import { RoleEnum } from "src/core/enums/roles.enum";
import { Character } from "./character.entity";

@Entity("tb_user")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  appId: string;

  @Column({ length: 30 })
  @Unique(['username'])
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ 
    type: 'simple-array',
    nullable: false,
    transformer: {
      to: (value: RoleEnum[]) => Array.isArray(value) ? value.join(',') : '0',
      from: (value: unknown): RoleEnum[] => {
        if (!value) return [RoleEnum.USER];
        if (Array.isArray(value)) return value;
        return String(value).split(',').map(v => v.trim() as RoleEnum);
      }
    }
  })
  roles: RoleEnum[];

  @Column({})
  nickname: string;

  @Column({ nullable: true })
  active: number

  @Column()
  salt: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  create_time: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  update_time: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @OneToMany(() => Trade, trade => trade.seller)
  sellTrades: Trade[];

  @OneToMany(() => Transaction, transaction => transaction.buyer)
  buyTrades: Trade[];

  @OneToMany(() => Inventory, inventory => inventory.user)
  inventoryItems: Inventory[];

  @OneToMany(() => Mail, mail => mail.recipient)
  receivedMails: Mail[];

  @OneToOne(() => Character, character => character.user)
  character: Character;
}

