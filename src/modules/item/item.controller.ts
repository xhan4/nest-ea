import { Body, Controller, Delete, Get, Param, Post, Put, Req } from "@nestjs/common";
import { ItemService } from "./item.service";
import { CreateItemDto } from "./dto/create-item.dto";
import { UpdateItemDto } from "./dto/update-item.dto";
import { RoleEnum } from "src/core/enums/roles.enum";
import { Roles } from "src/core/decorators/rules.decorator";

@Controller('items')
export class ItemController {
  constructor(private readonly service: ItemService) {}
  
  @Roles(RoleEnum.ADMIN)
  @Post("create_item")
  async createItem(@Body() createDto: CreateItemDto,@Req() req:any) {
    const userId = req.user.id;
    return this.service.createItem(createDto,userId);
  }

  @Roles(RoleEnum.ADMIN)
  @Put(':id')
  async updateItem(@Param('id') id: number, @Body() updateDto: UpdateItemDto) {
    return this.service.updateItem(id, updateDto);
  }

  @Roles(RoleEnum.ADMIN)
  @Delete(':id')
  async deleteItem(@Param('id') id: number) {
    return this.service.deleteItem(id);
  }
  
  @Roles(RoleEnum.ADMIN)
  @Get(':id')
  async getItem(@Param('id') id: number) {
    return this.service.getItemById(id);
  }
}
