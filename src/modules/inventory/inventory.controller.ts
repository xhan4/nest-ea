import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { AddItemDto } from "./dto/add-item.dto";

@Controller('inventory')

export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get('/list')
  async getItemsByUser(@Req() req:any) {
   const {current,pagesize} = req.query
    return this.service.getUserItems(req.user.id,current,pagesize);
  }

  @Get('/detail/:itemId')
  async getItemDetail(@Param('itemId') itemId: number) {
    return this.service.getItemDetail(itemId);
  }

  @Post('/addItem')
  async addItem(@Body() addItemDto: AddItemDto, @Req() req:any) {
    const { itemId, count } = addItemDto;
    const userId = req.user.id
    return this.service.addItemToInventory(userId, itemId, count);
  }

}
