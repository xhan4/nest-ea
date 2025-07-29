import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Item } from "./item.entity";
import { Character } from "./character.entity";
export enum TradeStatus {
  LISTED = "LISTED", // 已上架
  PARTIALLY_SOLD = "PARTIALLY_SOLD", // 部分售出
  SOLD = "SOLD", // 已售出
  CANCELLED = "CANCELLED", // 已取消
}

@Entity("tb_trade")
export class Trade {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Item)
  item: Item; 

  @Column({ type: "decimal", precision: 10, scale: 2 })
  perPrice: number; 

  @Column()
  quantity: number; 

  @Column({ type: "enum", enum: TradeStatus, default: TradeStatus.LISTED })
  status: TradeStatus; 

  @Column({ type: "timestamp", nullable: true })
  soldAt: Date;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  fee: number; 

  @ManyToOne(() => Character)
  seller: Character; 
}
