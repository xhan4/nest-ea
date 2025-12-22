import { Controller, Get, Post, Req, Param, Body } from '@nestjs/common';
import { MailService } from './mail.service';
import { Roles } from 'src/core/decorators/rules.decorator';
import { RoleEnum } from 'src/core/enums/roles.enum';

@Controller('mail')
export class MailController {
  constructor(private mailService: MailService) {}

  @Get('list')
  async getMailList(@Req() req) {
    const {current,pagesize} = req.query;
    // 实现获取用户邮件列表逻辑
    return this.mailService.getMailListById(current,pagesize);
  }

  @Get('list_by_userId')
  async getListByUserId(@Req() req) {
    const {current,pagesize} = req.query;
    const {userId} = req.user;
    // 实现获取用户邮件列表逻辑
    return this.mailService.getMailListById(userId,current,pagesize);
  }

  @Post('send_to_user')
  async sendToUser(@Body('subject') subject:string,
    @Body('content') content:string,
    @Body('userId') userId: number,
  ) {
    return this.mailService.sendSigleMail(userId, subject, content);
  }
  
  @Roles(RoleEnum.ADMIN)
  @Post('batch_send')
  async sendSystemBroadcast(
    @Body('subject') subject:string,
    @Body('content') content:string,
    @Body('userIds') userIds: number[],
  ) {
    return this.mailService.batchSendMails(subject,content,userIds);
  }
}
