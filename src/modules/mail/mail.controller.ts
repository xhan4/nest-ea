import { Controller, Get, Post, Req, Param, Body } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailType } from 'src/entities/mail.entity';

@Controller('mail')
export class MailController {
  constructor(private mailService: MailService) {}

  @Get('list')
  async getInbox(@Req() req) {
    const userId = req.user.id;
    // 实现获取用户邮件列表逻辑
    return this.mailService.getMailListById(userId);
  }

  @Post('claim/:mailId')
  async claimAttachment(@Param('mailId') mailId: number, @Req() req) {
    const userId = req.user.id;
    return this.mailService.claimAttachment(mailId, userId);
  }

  @Post('broadcast')
  async sendSystemBroadcast(
    @Body('subject') subject: string,
    @Body('content') content: string,
    @Body('mailType') mailType: MailType
  ) {
    return this.mailService.sendSystemBroadcast(subject, content, mailType);
  }
}
