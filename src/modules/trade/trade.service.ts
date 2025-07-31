import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Trade, TradeStatus } from "src/entities/trade.entity";
import { Item } from "src/entities/item.entity";
import { Inventory } from "src/entities/inventory.entity";

import { MailService } from "../mail/mail.service";
import { Transaction } from "src/entities/transaction.entity";
import { Character } from "src/entities/character.entity";

@Injectable()
export class TradeService {
  constructor(
    @InjectRepository(Trade)
    private tradeRepo: Repository<Trade>,
    private mailService: MailService
  ) { }

  async listings(sellerId: number, itemId: number, quantity: number, perPrice: number) {
    return this.tradeRepo.manager.transaction(async (manager) => {
      // 使用更高效的查询方式，例如使用缓存或批量查询
      const [seller, item, inventory] = await Promise.all([
        manager.findOne(Character, { where: { id: sellerId } }),
        manager.findOne(Item, { where: { id: itemId } }),
        manager.findOne(Inventory, { where: { character: { id: sellerId }, item: { id: itemId } } }),
      ]);

      if (!seller || !item || !inventory || inventory.count < quantity) {
        throw new HttpException('物品不存在或数量不足', HttpStatus.BAD_REQUEST);
      }
      const newCount = inventory.count - quantity;
      //更新数量
      await manager.update(Inventory, inventory.id, {
          count: newCount,
        });
      const trade = await manager.save(Trade, {
        seller,
        item,
        quantity,
        perPrice,
        status: TradeStatus.LISTED,
        fee: 0.05
      });

      return { success: true, tradeId: trade.id };
    });
  }

  // 买家购买物品
  async buyItem(buyerId: number, tradeId: number, quantity: number) {
    let transactionResult;
    try {
      transactionResult = await this.tradeRepo.manager.transaction(async (manager) => {
        const [buyer, trade] = await Promise.all([
          manager.findOne(Character, { where: { id: buyerId } }),
          manager.findOne(Trade, {
            where: { id: tradeId, status: TradeStatus.LISTED },
            relations: ['seller', 'item'],
          }),
        ]);

        if (!buyer || !trade) {
          throw new HttpException('无效的购买请求', HttpStatus.BAD_REQUEST);
        }

        if (quantity > trade.quantity) {
          throw new HttpException('购买数量超过可售数量', HttpStatus.BAD_REQUEST);
        }

        const totalPrice = trade.perPrice * quantity;
        const feeRate = 0.05;
        const fee = totalPrice * feeRate;
        const sellerEarnings = totalPrice - fee;

        if (buyer.balance < totalPrice) {
          throw new HttpException('金币不足', HttpStatus.BAD_REQUEST);
        }

        await manager.update(Character, buyerId, {
          balance: () => `balance - ${totalPrice}`,
        });

        if (quantity === trade.quantity) {
          await manager.update(Trade, tradeId, {
            status: TradeStatus.SOLD,
            soldAt: new Date(),
          });
        } else {
          await manager.update(Trade, tradeId, {
            status: TradeStatus.PARTIALLY_SOLD,
            quantity: trade.quantity - quantity,
          });
        }

        const transaction = await manager.save(Transaction, {
          buyer,
          seller: trade.seller,
          item: trade.item,
          trade,
          quantity,
          totalPrice,
          fee,
          sellerEarnings,
          transactionTime: new Date(),
        });

        return {
          buyer,
          tradeItem: trade.item,
          quantity,
          transactionId: transaction.id,
          seller: trade.seller,
          sellerEarnings
        };
      });

      // 在事务外部发送邮件
      await this.mailService.sendBuyerMail(
        transactionResult.buyer,
        transactionResult.tradeItem,
        transactionResult.quantity,
      );
      await this.mailService.sendSellerMail(
        transactionResult.seller,
        transactionResult.sellerEarnings,
      );

      return { success: true, transactionId: transactionResult.transactionId };
    } catch (error) {
      // 处理异常
      throw error;
    }
  }

  async claimItem(tradeId: number, characterId: number) {
    return this.tradeRepo.manager.transaction(async (manager) => {
      const trade = await manager.findOne(Transaction, {
        where: { id: tradeId, buyer: { id: characterId }, buyerClaimed: false },
        relations: ['item'],
      });

      if (!trade) {
        throw new HttpException('无效的交易或已领取物品', HttpStatus.BAD_REQUEST);
      }

      const buyerInventory = await manager.findOne(Inventory, {
        where: { character: { id: characterId }, item: { id: trade.item.id } },
      });

      if (buyerInventory) {
        await manager.update(Inventory, buyerInventory.id, {
          count: buyerInventory.count + trade.quantity,
        });
      } else {
        await manager.save(Inventory, {
          user: { id: characterId },
          item: { id: trade.item.id },
          count: trade.quantity,
        });
      }

      await manager.update(Transaction, tradeId, { buyerClaimed: true });

      return { success: true };
    });
  }

  async claimFunds(tradeId: number, characterId: number) {
    return this.tradeRepo.manager.transaction(async (manager) => {
      const trade = await manager.findOne(Transaction, {
        where: { id: tradeId, seller: { id: characterId }, sellerClaimed: false },
      });

      if (!trade) {
        throw new HttpException('无效的交易或已领取金币', HttpStatus.BAD_REQUEST);
      }

      await manager.update(Character, characterId, {
        balance: () => `balance + ${trade.sellerEarnings}`,
      });

      await manager.update(Transaction, tradeId, { sellerClaimed: true });

      return { success: true };
    });
  }
}