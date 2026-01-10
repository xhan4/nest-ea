import { Controller, Get, Query, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { PointsService } from './points.service';


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
      code: 0,
      data: {
        userId,
        points,
        membership,
      },
      message: '查询成功',
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
    const result = await this.pointsService.getUserPointsHistory(userId, page, limit);
    
    return {
      code: 0,
      data: result,
      message: '查询成功',
    };
  }
}