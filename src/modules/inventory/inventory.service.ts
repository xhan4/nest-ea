import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from '../../entities/inventory.entity';
import { Item } from '../../entities/item.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory> ,// 添加 ItemRepository
    @InjectRepository(Item)
    private itemRepo: Repository<Item> // 添加 ItemRepository
  ) {}
  async getUserItems(userId: number) {
    return this.inventoryRepo.find({
        where: {
            user: { id: userId },
            item: { isTrading: false }
        },
        relations: ['user', 'item', 'item.owner']
    });
}

  async getItemDetail(itemId: number) {
    return this.itemRepo.findOne({
      where: { id: itemId },
      relations: ['owner']
    });
  }
   
  async listItem(userId: number, itemId: number, price: number) {
  const result = await this.itemRepo.update(
    { 
      id: itemId,
      owner: { id: userId } 
    },
    {
      isTrading: true,
      price,
      lastTradeTime: new Date()
    }
  );

  if (result.affected === 0) {
    throw new HttpException('', HttpStatus.FORBIDDEN);
  }
  
  return result;
}

async addItemToInventory(userId: number, itemId: number, count: number) {
  return this.inventoryRepo.manager.transaction(async (manager) => {
    // 查找是否已有该物品
    const existingItem = await manager.findOne(Inventory, {
      where: {
        user: { id: userId },
        item: { id: itemId }
      }
    });

    if (existingItem) {
      // 如果已有则增加数量
      return manager.update(Inventory, existingItem.id, {
        count: existingItem.count + count
      });
    } else {
      // 否则创建新记录
      const newItem = manager.create(Inventory, {
        user: { id: userId },
        item: { id: itemId },
        count
      });
      return manager.save(newItem);
    }
  });
 }
}