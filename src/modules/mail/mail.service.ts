import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../../entities/item.entity';
import { Mail, MailType, REWARDTYPE } from '../../entities/mail.entity';
import { Inventory } from '../../entities/inventory.entity';
import { NotifyGateway } from './notify.gateway';
import { Character } from 'src/entities/character.entity';

@Injectable()
export class MailService {
  constructor(
    @InjectRepository(Mail)
    private mailRepo: Repository<Mail>,
    private notifyGateway: NotifyGateway
  ) { }
  async getMailListById(characterId: number, current: number = 1, pagesize: number = 10) {
    const skip = (current - 1) * pagesize;
    const [mails, total] = await this.mailRepo.findAndCount({
      where: {
        recipient: { id: characterId }
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
  async sendBuyerMail(buyer: Character, item: Item, quantity: number) {
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

  async sendSellerMail(seller: Character, earnings: number) {
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

  async claimAttachment(mailId: number, characterId: number) {
    return this.mailRepo.manager.transaction(async (manager) => {
      const mail = await manager.findOne(Mail, {
        where: { id: mailId, recipient: { id: characterId }, isClaimed: false },
        relations: ['recipient', 'itemAttachment'],
      });

      if (!mail) {
        throw new Error('无效的邮件或附件已领取');
      }
      const claimInventItem = async (characterId: number, itemId: number, count: number) => {
        const inventory = await manager.findOne(Inventory, {
          where: { character: { id: characterId }, item: { id: itemId } },
        });
        if (inventory) {
          await manager.update(Inventory, inventory.id, {
            count: inventory.count + count,
          });
        } else {
          await manager.save(Inventory, {
            user: { id: characterId },
            item: { id: itemId },
            count,
          });
        }
      }
      if (mail.mailType === MailType.TRADE_ITEM) {
        claimInventItem(characterId, mail.itemAttachment.id, mail.quantity)
      } else if (mail.mailType === MailType.TRADE_GOLD) {
        await manager.update(Character, characterId, {
          balance: () => `balance + ${mail.goldAttachment}`,
        });
      } else if (mail.mailType === MailType.SYSTEM_AWARD) {
        for (const reward of mail.rewards) {
          if (reward.type === REWARDTYPE.ITEM) {
            await claimInventItem(characterId, reward.itemId, reward.amount)
          } else if (reward.type === REWARDTYPE.GOLD) {
            await manager.update(Character, characterId, {
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
    characterIds: number[],
    rewards: Array<{
      type: REWARDTYPE;
      itemId?: number;
      amount: number;
    }>
  ) {
    return this.mailRepo.manager.transaction(async (manager) => {
      const mails = characterIds.map(characterId => {
         const mail = this.mailRepo.create({
        recipient: {id:characterId},
        mailType,
        subject,
        content,
        rewards,
        sentAt: new Date(),
      });
        return manager.save(mail);
      });
      await Promise.all(mails);
      this.notifyGateway.server.emit('new_mail', {});
    });
  }
}