import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mail } from 'src/entities/mail.entity';
import { NotifyModule } from '../notify/notify.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mail]),
    NotifyModule,
  ],
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule {}
