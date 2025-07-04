import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { ListItemDto } from "./dto/list-item.dto";
import { AddItemDto } from "./dto/add-item.dto";

@Controller('inventory')
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get('/list/:userId')
  async getItemsByUser(@Param('userId') userId: number) {
    return this.service.getUserItems(userId);
  }

  @Get('/detail/:userId')
  async getItemDetail(@Param('userId') userId: number) {
    return this.service.getItemDetail(userId);
  }

  
  @Post('/listItem')
  async listItem(@Body() listItem:ListItemDto) {
    const {userId, itemId, price} = listItem
    return this.service.listItem(userId, itemId, price);
  }

  @Post('/addItem')
  async addItem(@Body() addItemDto: AddItemDto) {
    const { userId, itemId, count } = addItemDto;
    return this.service.addItemToInventory(userId, itemId, count);
  }
}
