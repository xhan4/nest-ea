import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { AddItemDto } from "./dto/add-item.dto";
import { RemoveItemDto } from "./dto/remove-item.dto";

@Controller('inventory')

export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get('/list')
  async getItemsByCharacter(@Req() req:any) {
   const {current,pagesize,characterId} = req.query
    return this.service.getCharacterItems(characterId,current,pagesize);
  }

  @Get('/detail/:itemId')
  async getItemDetail(@Param('itemId') itemId: number) {
    return this.service.getItemDetail(itemId);
  }

  @Post('/add_item')
  async addItem(@Body() addItemDto: AddItemDto, @Req() req:any) {
    const { itemId, count,characterId,sectId} = addItemDto;
    return this.service.addItemToInventory(characterId, itemId, count,sectId);
  }

  @Post('/remove_item')
  async removeItem(@Body() removeItemDto: RemoveItemDto) {
    const { characterId,itemId,count} = removeItemDto;
    return this.service.removeItemFromInventory(characterId, itemId,count);
  }
}
