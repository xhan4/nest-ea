import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Trade } from "src/entities/trade.entity";
import { Repository } from "typeorm";
import { Item } from "src/entities/item.entity";
import { User } from "src/entities/user.entity";
import { TradeStatus } from "src/entities/trade-status.enum";

@Injectable()
export class TradeService {
  notifyGateway: any;
  constructor(
    @InjectRepository(Trade)
    private tradeRepo: Repository<Trade>,
  ) {}

  async executeTrade(buyerId: number, itemId: number) {
    return this.tradeRepo.manager.transaction(async (manager) => {
      // 1. 获取
      const trade = await manager.findOne(Trade, {
        where: { item: { id: itemId } },
        relations: ['seller', 'item']
      });

      // 2. 验证
      if (!trade || trade.status !== TradeStatus.LISTED) {
        throw new HttpException('', HttpStatus.BAD_REQUEST);
      }

      const buyer = await manager.findOne(User, { where: { id: buyerId } });
      if (buyer.balance < trade.price) {
        throw new HttpException('', HttpStatus.BAD_REQUEST);
      }

      //执行
      await manager.update(User, buyerId, {
        balance: buyer.balance - trade.price
      });

      await manager.update(User, trade.seller.id, {
        balance: () => `balance + ${trade.price}`
      });

      await manager.update(Item, itemId, {
        owner: { id: buyerId }
      });

      await manager.update(Trade, trade.id, {
        status: TradeStatus.COMPLETED,
        buyer: { id: buyerId },
        completedAt: new Date() // 现在这个字段已正确定义
      });

      // 给买家发实时通知
      this.notifyGateway.sendToUser(buyerId, 'trade_completed', {
        type: 'buy',
        itemName: trade.item.name,
        price: trade.price
      });

      // 给卖家发实时通知
      this.notifyGateway.sendToUser(trade.seller.id, 'trade_completed', {
        type: 'sell',
        itemName: trade.item.name,
        price: trade.price
      });

      return { success: true };
    });
  }
}
