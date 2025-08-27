import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../../entities/item.entity';
import { Mail } from '../../entities/mail.entity';
import { Inventory } from '../../entities/inventory.entity';
import { NotifyGateway } from 'src/core/gateway/notify.gateway';
import { Character } from 'src/entities/character.entity';
import { EventType } from 'src/core/enums/event.enum';
import { ItemType } from 'src/core/enums/item-type.enum';

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
      skip,
      take: pagesize
    });
    return {
      mails,
      total,
    };
  }
  async sendBuyerMail(buyer: Character, item: Item, quantity: number) {
    const mail = await this.mailRepo.save({
      recipient: buyer,
      subject: '物品购买成功',
      content: "",
      quantity,
      rewards: [
        {
          type: item.type,
          itemId: item.id,
          itemName: item.name,
          amount: quantity,
        }
      ],
      sentAt: new Date(),
    });
    // 发送实时通知
    this.notifyGateway.sendNotify(buyer.id, EventType.NEW_MAIL, mail);
    return mail;
  }

  async sendSellerMail(seller: Character, earnings: number) {
    const mail = await this.mailRepo.save({
      recipient: seller,
      subject: "物品出售成功",
      content: "",
      rewards: [
        {
          type: ItemType.GOLD,
          itemId: 0,
          itemName: '',
          amount: earnings,
        }
      ],
      sentAt: new Date(),
    });
    this.notifyGateway.sendNotify(seller.id, EventType.NEW_MAIL, mail);
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
      for (const reward of mail.rewards) {
          if (reward.type === ItemType.GOLD) if (reward.type ===  ItemType.GOLD) {
            await manager.update(Character, characterId, {
              balance: () => `balance + ${reward.amount}`,
            });
          }else {
              await claimInventItem(characterId, reward.itemId, reward.amount)
          }
      }
      await manager.update(Mail, mailId, {
        isClaimed: true,
      });

      return { success: true };
    });
  }

  async sendBatchRewards(
    subject: string,
    content: string,
    characterIds: number[],
    rewards: Array<{
      type: ItemType;
      itemId: number;
      itemName: string;
      amount: number;
    }>
  ) {
    return this.mailRepo.manager.transaction(async (manager) => {
      const mails = characterIds.map(characterId => {
         const mail = this.mailRepo.create({
        recipient: {id:characterId},
        subject,
        content,
        rewards,
        sentAt: new Date(),
      });
        return manager.save(mail);
      });
        const savedMails = await Promise.all(mails);
        for (const mail of savedMails) {
          this.notifyGateway.sendNotify(mail.recipient.id,EventType.NEW_MAIL,{
            id: mail.id,
            subject: mail.subject,
            content: mail.content,
            sentAt: mail.sentAt,
            rewards: mail.rewards.map(reward=>({
              type: reward.type,
              itemId: reward.itemId,
              amount: reward.amount,
            })),
            isRead: mail.isRead,
            isClaimed: mail.isClaimed,
          });
        }
    });
  }
}