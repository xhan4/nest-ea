import { Body, Controller, Param, Post, Req } from "@nestjs/common";
import { TradeService } from "./trade.service";
import { BuyItemDto } from "./dto/buy-item.dto";

@Controller('trade')
export class TradeController {
  constructor(private tradeService: TradeService) {}

  // 卖家上架物品
  @Post('list')
  async listItem(
    @Body('itemId') itemId: number,
    @Body('quantity') quantity: number,
    @Body('pricePerUnit') pricePerUnit: number,
    @Req() req,
  ) {
    const sellerId = req.user.id;
    return this.tradeService.listItem(sellerId, itemId, quantity, pricePerUnit);
  }

  // 买家购买物品
  @Post('buy/:tradeId')
  async buyItem(@Param('tradeId') tradeId: number, @Req() req) {
    const buyerId = req.user.id;
    return this.tradeService.buyItem(buyerId, tradeId);
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
