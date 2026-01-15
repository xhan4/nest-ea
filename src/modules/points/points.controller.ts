import { Controller, Get, Query, ParseIntPipe, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { PointsService } from './points.service';
import { RoleEnum } from 'src/core/enums/roles.enum';
import { Roles } from 'src/core/decorators/rules.decorator';

@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  // 获取用户积分和会员等级
  @Get('user-points')
  async getUserPointsAndMembership(@Req() req) {
    const userId = req.user.userId;
    const points = await this.pointsService.getUserPoints(userId);
    const membership = await this.pointsService.getUserMembership(userId);
    
    return {
      userId,
      points,
      membership,
    };
  }

  // 获取用户积分记录
  @Get('history')
  async getUserPointsHistory(
    @Req() req,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    const userId = req.user.userId;
    return this.pointsService.getUserPointsHistory(userId, page, limit);
  }
  
   //管理员获取所有用户积分记录
  @Get('admin/history')
  @Roles(RoleEnum.ADMIN)
  async getAllUsersPointsHistory(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('username') username?: string,
    @Query('nickname') nickname?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // 解析日期参数
    let parsedStartDate: Date | undefined;
    let parsedEndDate: Date | undefined;
    
    if (startDate) {
      parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        throw new BadRequestException('开始日期格式不正确');
      }
    }
    
    if (endDate) {
      parsedEndDate = new Date(endDate);
      if (isNaN(parsedEndDate.getTime())) {
        throw new BadRequestException('结束日期格式不正确');
      }
      // 设置结束日期为当天的23:59:59
      parsedEndDate.setHours(23, 59, 59, 999);
    }
    
    return this.pointsService.getAllUsersPointsHistory(
      page,
      limit,
      username,
      nickname,
      parsedStartDate,
      parsedEndDate
    );
  }
}