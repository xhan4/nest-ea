import { Controller, Get, Post, Req, Param, Body } from '@nestjs/common';
import { MailService } from './mail.service';
import { Roles } from 'src/core/decorators/rules.decorator';
import { RoleEnum } from 'src/core/enums/roles.enum';
import { ItemType } from 'src/core/enums/item-type.enum';

@Controller('mail')
export class MailController {
  constructor(private mailService: MailService) {}

  @Get('list')
  async getInbox(@Req() req) {
    const {characterId,current,pagesize} = req.query;
    // 实现获取用户邮件列表逻辑
    return this.mailService.getMailListById(characterId,current,pagesize);
  }

  @Get('list_by_characterId')
  async getInboxByCharacterId(@Req() req) {
    const {current,pagesize} = req.query;
    const {characterId} = req.user;
    // 实现获取用户邮件列表逻辑
    return this.mailService.getMailListById(characterId,current,pagesize);
  }

  @Post('claim/:mailId')
  async claimAttachment(@Param('mailId') mailId: number, @Req() req) {
    const {characterId} = req.query;
    return this.mailService.claimAttachment(mailId, characterId);
  }
  
  @Roles(RoleEnum.ADMIN)
  @Post('reward')
  async sendSystemBroadcast(
    @Body('subject') subject:string,
    @Body('content') content:string,
    @Body('characterIds') characterIds: number[],
    @Body('rewards') rewards: Array<{
      type: ItemType;
      itemId: number;
      itemName: string;
      amount: number;
    }>
  ) {
    return this.mailService.sendBatchRewards(subject,content,characterIds,rewards);
  }
}
