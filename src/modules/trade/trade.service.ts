import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Trade, TradeStatus } from "src/entities/trade.entity";
import { Repository, EntityManager } from "typeorm";
import { User } from "src/entities/user.entity";
import { Item } from "src/entities/item.entity";
import { Inventory } from "src/entities/inventory.entity";
import { NotifyGateway } from '../notify/notify.gateway';
import { MailService } from "../mail/mail.service";
import { Transaction } from "src/entities/transaction.entity";

@Injectable()
export class TradeService {
  constructor(
    @InjectRepository(Trade)
    private tradeRepo: Repository<Trade>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Item)
    private itemRepo: Repository<Item>,
    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    private readonly notifyGateway: NotifyGateway,
    private mailService: MailService
  ) {}

  // 卖家上架物品
  async listItem(sellerId: number, itemId: number, quantity: number, pricePerUnit: number) {
    return this.tradeRepo.manager.transaction(async (manager) => {
      const [seller, item, inventory] = await Promise.all([
        manager.findOne(User, { where: { id: sellerId } }),
        manager.findOne(Item, { where: { id: itemId } }),
        manager.findOne(Inventory, { where: { user: { id: sellerId }, item: { id: itemId } } }),
      ]);

      if (!seller || !item || !inventory || inventory.count < quantity) {
        throw new HttpException('物品不存在或数量不足', HttpStatus.BAD_REQUEST);
      }

      // 从背包移除物品
      await manager.update(Inventory, inventory.id, {
        count: inventory.count - quantity,
      });

      // 创建交易记录
      const trade = await manager.save(Trade, {
        seller,
        item,
        quantity,
        pricePerUnit,
        status: TradeStatus.LISTED,
      });

      return { success: true, tradeId: trade.id };
    });
  }

  // 买家购买物品
  async buyItem(buyerId: number, tradeId: number, feeRate = 0.05) {
    return this.tradeRepo.manager.transaction(async (manager) => {
      const [buyer, trade] = await Promise.all([
        manager.findOne(User, { where: { id: buyerId } }),
        manager.findOne(Trade, {
          where: { id: tradeId, status: TradeStatus.LISTED },
          relations: ['seller', 'item'],
        }),
      ]);

      if (!buyer || !trade) {
        throw new HttpException('无效的购买请求', HttpStatus.BAD_REQUEST);
      }

      const totalPrice = trade.pricePerUnit * trade.quantity;
      const fee = totalPrice * feeRate;
      const sellerEarnings = totalPrice - fee;

      if (buyer.balance < totalPrice) {
        throw new HttpException('金币不足', HttpStatus.BAD_REQUEST);
      }

      // 扣除买家金币
      await manager.update(User, buyerId, {
        balance: () => `balance - ${totalPrice}`,
      });

      // 更新交易状态
      await manager.update(Trade, tradeId, {
        status: TradeStatus.SOLD,
        soldAt: new Date(),
        totalPrice,
        fee,
        sellerEarnings,
        buyer
      });

      // 创建交易记录
      const transaction = await manager.save(Transaction, {
        buyer,
        seller: trade.seller,
        item: trade.item,
        trade,
        quantity: trade.quantity,
        totalPrice,
        fee,
        sellerEarnings,
        transactionTime: new Date(),
      });

      // 发送邮件
      await this.mailService.sendBuyerMail(
        buyer,
        trade.item,
        trade.quantity,
        transaction.id,
      );
      await this.mailService.sendSellerMail(
        trade.seller,
        sellerEarnings,
        transaction.id,
      );

      return { success: true, transactionId: transaction.id };
    });
  }

  // 买家领取物品
  async claimItem(tradeId: number, userId: number) {
    return this.tradeRepo.manager.transaction(async (manager) => {
      const trade = await manager.findOne(Trade, {
        where: { id: tradeId, buyer: { id: userId }, buyerClaimed: false },
        relations: ['item'],
      });

      if (!trade) {
        throw new HttpException('无效的交易或已领取物品', HttpStatus.BAD_REQUEST);
      }

      const buyerInventory = await manager.findOne(Inventory, {
        where: { user: { id: userId }, item: { id: trade.item.id } },
      });

      if (buyerInventory) {
        await manager.update(Inventory, buyerInventory.id, {
          count: buyerInventory.count + trade.quantity,
        });
      } else {
        await manager.save(Inventory, {
          user: { id: userId },
          item: { id: trade.item.id },
          count: trade.quantity,
        });
      }

      await manager.update(Trade, tradeId, { buyerClaimed: true });

      return { success: true };
    });
  }

  // 卖家领取金币
  async claimFunds(tradeId: number, userId: number) {
    return this.tradeRepo.manager.transaction(async (manager) => {
      const trade = await manager.findOne(Trade, {
        where: { id: tradeId, seller: { id: userId }, sellerClaimed: false },
      });

      if (!trade) {
        throw new HttpException('无效的交易或已领取金币', HttpStatus.BAD_REQUEST);
      }

      await manager.update(User, userId, {
        balance: () => `balance + ${trade.sellerEarnings}`,
      });

      await manager.update(Trade, tradeId, { sellerClaimed: true });

      return { success: true };
    });
  }
}