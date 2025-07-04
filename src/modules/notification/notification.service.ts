import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../entities/notification.entity';
import { NotifyGateway } from '../../core/notify/notify.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private messageRepo: Repository<Notification>,
    private notifyGateway: NotifyGateway
  ) {}

  async sendMessage(userId: number, title: string, content: string) {
    const message = this.messageRepo.create({
      recipient: { id: userId },
      title,
      content
    });
    
    const savedMsg = await this.messageRepo.save(message);
    
    // 发送实时通知
    this.notifyGateway.sendToUser(userId, 'new_message', {
      id: savedMsg.id,
      title,
      content,
      createdAt: savedMsg.createdAt
    });

    return savedMsg;
  }
}
