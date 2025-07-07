import { Body, Controller, Param, Post, Req } from "@nestjs/common";
import { TradeService } from "./trade.service";

@Controller('trade')
export class TradeController {
  constructor(private tradeService: TradeService) {}

  // 卖家上架物品
  @Post('listings')
  async listItem(
    @Body('itemId') itemId: number,
    @Body('count') count: number,
    @Body('price') price: number,
    @Req() req,
  ) {
    const sellerId = req.user.id;
    return this.tradeService.listItem(sellerId, itemId, count, price);
  }

  // 买家购买物品
  @Post('buy/:tradeId')
  async buyItem(
    @Param('tradeId') tradeId: number,
    @Body('count') count: number, // 新增参数，用于指定购买数量
    @Req() req
  ) {
    const buyerId = req.user.id;
    // 如果未传入 count，默认购买全部
    return this.tradeService.buyItem(buyerId, tradeId, count);
  }

  // 买家领取物品
  @Post('claim/item/:tradeId')
  async claimItem(@Param('tradeId') tradeId: number, @Req() req) {
    return this.tradeService.claimItem(tradeId, req.user.id);
  }

  // 卖家领取金币
  @Post('claim/funds/:tradeId') 
  async claimFunds(@Param('tradeId') tradeId: number, @Req() req) {
    return this.tradeService.claimFunds(tradeId, req.user.id);
  }
}
