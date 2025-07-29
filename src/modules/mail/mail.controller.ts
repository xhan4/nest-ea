import { Controller, Get, Post, Req, Param, Body } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailType, REWARDTYPE } from 'src/entities/mail.entity';

@Controller('mail')
export class MailController {
  constructor(private mailService: MailService) {}

  @Get('list')
  async getInbox(@Req() req) {
    const {characterId} = req.query;
    // 实现获取用户邮件列表逻辑
    return this.mailService.getMailListById(characterId);
  }

  @Post('claim/:mailId')
  async claimAttachment(@Param('mailId') mailId: number, @Req() req) {
    const {characterId} = req.query;
    return this.mailService.claimAttachment(mailId, characterId);
  }

  @Post('reward')
  async sendSystemBroadcast(
    @Body('mailType') mailType:MailType,
    @Body('subject') subject:string,
    @Body('content') content:string,
    @Body('characterIds') characterIds: number[],
    @Body('rewards') rewards: Array<{
      type: REWARDTYPE;
      itemId?: number;
      amount: number;
    }>
  ) {
    return this.mailService.sendBatchRewards(mailType,subject,content,characterIds,rewards);
  }
}
