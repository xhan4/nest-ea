import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mail } from 'src/entities/mail.entity';
import { Inventory } from 'src/entities/inventory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mail, Inventory]) // 注册 Mail 和 Inventory 实体
  ],
  controllers: [MailController],
  providers: [MailService]
})
export class MailModule {}
