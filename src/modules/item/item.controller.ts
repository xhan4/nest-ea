import { Body, Controller, Delete, Get, Param, Post, Put, Req } from "@nestjs/common";
import { ItemService } from "./item.service";
import { CreateItemDto } from "./dto/create-item.dto";
import { UpdateItemDto } from "./dto/update-item.dto";

@Controller('items')
export class ItemController {
  constructor(private readonly service: ItemService) {}

  @Post()
  async createItem(@Body() createDto: CreateItemDto, @Req() req) {
    return this.service.createItem(createDto, req.user.id);
  }

  @Put(':id')
  async updateItem(@Param('id') id: number, @Body() updateDto: UpdateItemDto) {
    return this.service.updateItem(id, updateDto);
  }

  @Delete(':id')
  async deleteItem(@Param('id') id: number) {
    return this.service.deleteItem(id);
  }

  @Get(':id')
  async getItem(@Param('id') id: number) {
    return this.service.getItemById(id);
  }
}
