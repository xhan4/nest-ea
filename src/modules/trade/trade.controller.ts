import { Body, Controller, Post, Req } from "@nestjs/common";
import { TradeService } from "./trade.service";
import { BuyItemDto } from "./dto/buy-item.dto";

@Controller('trade')
export class TradeController {
  constructor(private tradeService: TradeService) {}

  @Post('buy')
  async buyItem(@Body() buyDto: BuyItemDto, @Req() req) {
    return this.tradeService.executeTrade(req.user.id, buyDto.itemId);
  }
}
