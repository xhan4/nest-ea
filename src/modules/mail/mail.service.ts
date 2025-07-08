import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Item } from '../../entities/item.entity';
import { Mail, MailType, REWARDTYPE } from '../../entities/mail.entity';
import { Inventory } from '../../entities/inventory.entity';
import { NotifyGateway } from '../notify/notify.gateway';

@Injectable()
export class MailService {
  constructor(
    @InjectRepository(Mail)
    private mailRepo: Repository<Mail>,
    private notifyGateway: NotifyGateway
  ) { }
  async getMailListById(userId: number, current: number = 1, pagesize: number = 10) {
    const skip = (current - 1) * pagesize;
    const [mails, total] = await this.mailRepo.findAndCount({
      where: {
        recipient: { id: userId }
      },
      relations: ['itemAttachment'],
      skip,
      take: pagesize
    });
    // 4. 平铺数据结构
    const flatItems = mails.map(item => ({
      id: item.id,
      mailType: item.mailType,
      subject: item.subject,
      content: item.content,
      sentAt: item.sentAt,
      quantity: item.quantity,
      itemName: item.itemAttachment?.name,
      gold: item.goldAttachment,
      isRead: item.isRead,
      isClaimed: item.isClaimed,
    }));
    return {
      mails: flatItems,
      total,
    };
  }
  async sendBuyerMail(buyer: User, item: Item, quantity: number) {
    const mail = await this.mailRepo.save({
      recipient: buyer,
      mailType: MailType.TRADE_ITEM,  // 明确指定邮件类型
      subject: '物品购买成功',
      content: "",
      quantity,
      itemAttachment: item,
      goldAttachment: null,
      sentAt: new Date(),
    });
    // 发送实时通知
    this.notifyGateway.sendNotify(buyer.id, 'new_mail', {});
    return mail;
  }

  async sendSellerMail(seller: User, earnings: number) {
    const mail = await this.mailRepo.save({
      recipient: seller,
      mailType: MailType.TRADE_GOLD,
      subject: "物品出售成功",
      content: "",
      itemAttachment: null,
      goldAttachment: earnings,
      sentAt: new Date(),
    });

    // 发送实时通知
    this.notifyGateway.sendNotify(seller.id, 'new_mail', {});
    return mail;
  }

  async claimAttachment(mailId: number, userId: number) {
    return this.mailRepo.manager.transaction(async (manager) => {
      const mail = await manager.findOne(Mail, {
        where: { id: mailId, recipient: { id: userId }, isClaimed: false },
        relations: ['recipient', 'itemAttachment'],
      });

      if (!mail) {
        throw new Error('无效的邮件或附件已领取');
      }
      const claimInventItem = async (userId: number, itemId: number, count: number) => {
        const inventory = await manager.findOne(Inventory, {
          where: { user: { id: userId }, item: { id: itemId } },
        });
        if (inventory) {
          await manager.update(Inventory, inventory.id, {
            count: inventory.count + count,
          });
        } else {
          await manager.save(Inventory, {
            user: { id: userId },
            item: { id: itemId },
            count,
          });
        }
      }
      if (mail.mailType === MailType.TRADE_ITEM) {
        claimInventItem(userId, mail.itemAttachment.id, mail.quantity)
      } else if (mail.mailType === MailType.TRADE_GOLD) {
        await manager.update(User, userId, {
          balance: () => `balance + ${mail.goldAttachment}`,
        });
      } else if (mail.mailType === MailType.SYSTEM_AWARD) {
        for (const reward of mail.rewards) {
          if (reward.type === REWARDTYPE.ITEM) {
            await claimInventItem(userId, reward.itemId, reward.amount)
          } else if (reward.type === REWARDTYPE.GOLD) {
            await manager.update(User, userId, {
              balance: () => `balance + ${reward.amount}`,
            });
          }
        }
      }

      await manager.update(Mail, mailId, {
        isClaimed: true,
      });

      return { success: true };
    });
  }

  async sendBatchRewards(
    mailType: MailType,
    subject: string,
    content: string,
    userIds: number[],
    rewards: Array<{
      type: REWARDTYPE;
      itemId?: number;
      amount: number;
    }>
  ) {
    return this.mailRepo.manager.transaction(async (manager) => {
      const mails = userIds.map(userId => {
        return manager.save({
          recipient: userId,
          mailType,
          subject,
          content,
          rewards,
          sentAt: new Date(),
        });
      });
      await Promise.all(mails);
      this.notifyGateway.server.emit('new_mail', {});
    });
  }
}