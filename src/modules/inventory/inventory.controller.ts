import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { ListItemDto } from "./dto/list-item.dto";
import { AddItemDto } from "./dto/add-item.dto";
import { CompleteTradeDto } from "./dto/complete-trade.dto";

@Controller('inventory')

export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get('/list')
  async getItemsByUser(@Req() req:any) {
    return this.service.getUserItems(req.user.id);
  }

  @Get('/detail/:itemId')
  async getItemDetail(@Param('itemId') itemId: number) {
    return this.service.getItemDetail(itemId);
  }

  
  @Post('/listItem')
  async listItem(@Body() listItem:ListItemDto, @Req() req:any) {
    const {itemId, price,count} = listItem
    const userId = req.user.id
    return this.service.listItem(userId, itemId, price,count);
  }

  @Post('/addItem')
  async addItem(@Body() addItemDto: AddItemDto, @Req() req:any) {
    const { itemId, count } = addItemDto;
    const userId = req.user.id
    return this.service.addItemToInventory(userId, itemId, count);
  }

  @Post('/completeTrade')
  async completeTrade(@Body() completeTradeDto: CompleteTradeDto, @Req() req: any) {
    const { itemId, isSuccess,count} = completeTradeDto;
    const userId = req.user.id;
    return this.service.completeTrade(userId, itemId,count,isSuccess);
  }
}
