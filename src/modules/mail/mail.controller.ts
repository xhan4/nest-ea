import { Controller, Get, Post, Req, Param, Body } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailAttachmentType } from '../../entities/mail.entity'; // 添加这行导入

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

  @Post('system/broadcast')
  async sendSystemBroadcast(
    @Body('subject') subject: string,
    @Body('content') content: string,
    @Body('attachment') attachment?: { type: MailAttachmentType, data: any }
  ) {
    return this.mailService.sendSystemBroadcast(subject, content, attachment);
  }
}
