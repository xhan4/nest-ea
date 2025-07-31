import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Item } from "src/entities/item.entity";
import { Repository } from "typeorm";
import { CreateItemDto } from "./dto/create-item.dto";
import { UpdateItemDto } from "./dto/update-item.dto";

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private itemRepo: Repository<Item>
  ) {}

  async createItem(createDto: CreateItemDto,userId:number) {

    const item = this.itemRepo.create({
      ...createDto,
      create_time: new Date(),
      create_by: userId,
    });
    return this.itemRepo.save(item);
  }

  async updateItem(itemId: number, updateDto: UpdateItemDto) {
    return this.itemRepo.update(itemId, updateDto);
  }

  async deleteItem(itemId: number) {
    return this.itemRepo.delete(itemId);
  }

  async getItemById(itemId: number) {
    return this.itemRepo.findOne({ 
      where: { id: itemId },
    });
  }
}
