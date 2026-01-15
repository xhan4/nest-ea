import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mail } from '../../entities/mail.entity';
import { NotifyGateway } from 'src/core/gateway/notify.gateway';
import { EventType } from 'src/core/enums/event.enum';
import { User } from 'src/entities/user.entity';
@Injectable()
export class MailService {
  constructor(
    @InjectRepository(Mail)
    private mailRepo: Repository<Mail>,
    @InjectRepository(User)
    private notifyGateway: NotifyGateway
  ) { }
  async getMailListById(userId: number, current: number = 1, pagesize: number = 10) {
    const skip = (current - 1) * pagesize;
    const [mails, total] = await this.mailRepo.findAndCount({
      where: {
        recipient: { id: userId }
      },
      skip,
      take: pagesize
    });
    return {
      mails,
      total,
    };
  }

   async sendSigleMail(userId: number, subject: string, content: string) {
    const mail = await this.mailRepo.save({
      recipient: {id:userId},
      subject,
      content,
      sentAt: new Date(),
    });
    this.notifyGateway.sendNotify(userId, EventType.NEW_MAIL, {
      id: mail.id,
      subject: mail.subject,
      content: mail.content,
      sentAt: mail.sentAt,
      isRead: mail.isRead,
    });
    return {};
  }

  async batchSendMails(
    subject: string,
    content: string,
    userIds: number[],
   
  ) {
    return this.mailRepo.manager.transaction(async (manager) => {
      const mails = userIds.map(userId => {
         const mail = this.mailRepo.create({
        recipient: {id:userId},
        subject,
        content,
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
            isRead: mail.isRead,
          });
        }
    });
  }
}