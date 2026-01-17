import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';

import { VideoRecordService } from './video-record.service';
import { VideoStatus } from '../../entities/video-record.entity';

import { RoleEnum } from 'src/core/enums/roles.enum';
import { Roles } from 'src/core/decorators/rules.decorator';

@Controller('video-record')
export class VideoRecordController {
  constructor(private readonly videoRecordService: VideoRecordService) {}
  @Get('admin/history')
  @Roles(RoleEnum.ADMIN)
  async getAllUsersVideoRecords(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('username') username?: string,
    @Query('nickname') nickname?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: VideoStatus
  ) {
    // 转换分页参数
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    
    // 处理日期参数
    let start: Date | undefined;
    let end: Date | undefined;
    
    if (startDate) {
      start = new Date(startDate);
      if (isNaN(start.getTime())) {
        throw new Error('开始日期格式不正确，请使用YYYY-MM-DD格式');
      }
    }
    
    if (endDate) {
      end = new Date(endDate);
      if (isNaN(end.getTime())) {
        throw new Error('结束日期格式不正确，请使用YYYY-MM-DD格式');
      }
    }
    
    return await this.videoRecordService.getAllUsersVideoRecords(
      pageNum,
      limitNum,
      username,
      nickname,
      start,
      end,
      status
    );
  }

  @Get('user/:userId')
  @Roles(RoleEnum.ADMIN)
  async getUserVideoRecords(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) {
      throw new Error('用户ID必须是数字');
    }
    
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    
    return await this.videoRecordService.getUserVideoRecords(userIdNum, pageNum, limitNum);
  }
}