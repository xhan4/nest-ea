import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Item } from "./item.entity";

// 交易状态枚举，合并 MarketOrderStatus 和 TradeStatus
export enum TradeStatus {
  LISTED = "LISTED", // 已上架
  SOLD = "SOLD", // 已售出
  CANCELLED = "CANCELLED", // 已取消
}

@Entity("tb_trade")
export class Trade {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  seller: User; // 卖家

  @ManyToOne(() => User, { nullable: true })
  buyer: User; // 买家，可能为空，因为上架时还没有买家

  @ManyToOne(() => Item)
  item: Item; // 交易物品

  @Column({ type: "decimal", precision: 10, scale: 2 })
  pricePerUnit: number; // 物品单价

  @Column()
  quantity: number; // 交易数量

  @Column({ type: "enum", enum: TradeStatus, default: TradeStatus.LISTED })
  status: TradeStatus; // 交易状态

  @Column({ type: "timestamp", nullable: true })
  soldAt: Date; // 售出时间

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  totalPrice: number; // 交易总价，售出时计算

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  fee: number; // 手续费，售出时计算

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  sellerEarnings: number; // 卖家实际所得，售出时计算

  @Column({ default: false })
  buyerClaimed: boolean; // 买家是否已领取物品

  @Column({ default: false })
  sellerClaimed: boolean; // 卖家是否已领取金币
}
