import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mail } from 'src/entities/mail.entity';
import { NotifyGateway } from 'src/core/gateway/notify.gateway';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mail,User])
  ],
  controllers: [MailController],
  providers: [MailService,NotifyGateway],
})
export class MailModule {}
