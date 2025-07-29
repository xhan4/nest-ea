import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mail } from 'src/entities/mail.entity';
import { NotifyGateway } from './notify.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mail])
  ],
  controllers: [MailController],
  providers: [MailService,NotifyGateway],
})
export class MailModule {}
