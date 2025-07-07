import { Controller, Get, Post, Req, Param } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private mailService: MailService) {}

  @Get('inbox')
  async getInbox(@Req() req) {
    const userId = req.user.id;
    // 实现获取用户邮件列表逻辑
    return [];
  }

  @Post('claim/:mailId')
  async claimAttachment(@Param('mailId') mailId: number, @Req() req) {
    const userId = req.user.id;
    return this.mailService.claimAttachment(mailId, userId);
  }
}
