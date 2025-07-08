import {Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import * as crypto from "crypto";
import { Trade } from "./trade.entity";
import { Inventory } from "./inventory.entity";
import { Mail } from "./mail.entity";
import { Transaction } from "./transaction.entity";

@Entity("tb_user")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false }) 
  app_id: string; 

  @Column({ length: 30 })
  @Unique(['username'])
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: "0" })
  role: string;


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
}

