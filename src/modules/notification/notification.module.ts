import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../../entities/notification.entity';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotifyModule } from '../../core/notify/notify.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    NotifyModule // 导入NotifyModule
  ],
  controllers: [NotificationController],
  providers: [NotificationService]
})
export class NotificationModule {}
