import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Item } from '../../entities/item.entity';
import { Mail, MailAttachmentType, MailType } from '../../entities/mail.entity';
import { Inventory } from '../../entities/inventory.entity';
import { NotifyGateway } from '../notify/notify.gateway';

@Injectable()
export class MailService {
  constructor(
    @InjectRepository(Mail)
    private mailRepo: Repository<Mail>,
    private notifyGateway: NotifyGateway
  ) {}

  async sendBuyerMail(buyer: User, item: Item, quantity: number, transactionId: number) {
    const mail = await this.mailRepo.save({
      recipient: buyer,
      mailType: MailType.PERSONAL,  // 明确指定邮件类型
      subject: '物品购买成功',
      content: `您已成功购买 ${quantity} 个 ${item.name}，点击领取物品。`,
      attachmentType: MailAttachmentType.ITEM,
      itemAttachment: item,
      goldAttachment: null,
      sentAt: new Date(),
    });
    // 发送实时通知
    this.notifyGateway.sendNotify(
      buyer.id,
      'new_mail',
      {
        mailId: mail.id,
        subject: mail.subject,
        content: mail.content,
        sentAt: mail.sentAt,
        transactionId,
        attachmentType: mail.attachmentType  
      }
    );
    
    return mail;
  }

  async sendSellerMail(seller: User, earnings: number, transactionId: number) {
    const mail = await this.mailRepo.save({
      recipient: seller,
      subject: '物品出售成功',
      content: `您的物品已成功出售，获得 ${earnings} 金币，点击领取。`,
      attachmentType: MailAttachmentType.GOLD,
      itemAttachment: null,
      goldAttachment: earnings,
      sentAt: new Date(),
    });
    
    // 发送实时通知
    this.notifyGateway.sendNotify(
      seller.id,
      'new_mail',
      {
        mailId: mail.id,
        subject: mail.subject,
        content: mail.content,
        sentAt: mail.sentAt,
        transactionId,
        attachmentType: mail.attachmentType  
      }
    );
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

      if (mail.attachmentType === MailAttachmentType.ITEM) {
        const inventory = await manager.findOne(Inventory, {
          where: { user: { id: userId }, item: { id: mail.itemAttachment.id } },
        });

        if (inventory) {
          await manager.update(Inventory, inventory.id, {
            count: inventory.count + 1,
          });
        } else {
          await manager.save(Inventory, {
            user: { id: userId },
            item: mail.itemAttachment,
            count: 1,
          });
        }
      } else if (mail.attachmentType === MailAttachmentType.GOLD) {
        await manager.update(User, userId, {
          balance: () => `balance + ${mail.goldAttachment}`,
        });
      }

      await manager.update(Mail, mailId, {
        isClaimed: true,
      });

      return { success: true };
    });
  }

  async sendSystemBroadcast(
    subject: string, 
    content: string, 
    attachment?: { type: MailAttachmentType, data: any }
  ) {
    const mail = await this.mailRepo.save({
      mailType: MailType.SYSTEM,
      subject,
      content,
      attachmentType: attachment?.type,
      itemAttachment: attachment?.type === MailAttachmentType.ITEM ? { id: attachment.data } : null,
      goldAttachment: attachment?.type === MailAttachmentType.GOLD ? attachment.data : null,
      sentAt: new Date()
    });
  
    // 通过Socket.io广播给所有在线用户
    this.notifyGateway.server.emit('system_mail', {
      mailId: mail.id,
      subject: mail.subject,
      content: mail.content,
      attachmentType: mail.attachmentType,
      sentAt: mail.sentAt
    });
  
    return mail;
  }
}
