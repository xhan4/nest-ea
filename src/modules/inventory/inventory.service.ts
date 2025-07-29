import {  Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Inventory } from '../../entities/inventory.entity';
import { Item } from '../../entities/item.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory>,// 添加 ItemRepository
    @InjectRepository(Item)
    private itemRepo: Repository<Item> // 添加 ItemRepository
  ) { }
  async getCharacterItems(characterId: number, current: number = 1,pagesize: number = 10) {
    const skip = (current - 1) * pagesize;
     const [inventoryItems, total] = await this.inventoryRepo.findAndCount({
      where: {
        character: { id: characterId },
        count: MoreThan(0) // 只查询数量大于0的物品
      },
      relations: ['item'],
      skip,
      take: pagesize
    });
    // 4. 平铺数据结构
  const flatItems = inventoryItems.map(item => ({
    inventoryId: item.id,   // 库存记录ID
    itemId: item.item.id,   // 物品ID (重命名)
    count: item.count,      // 物品数量
    name: item.item.name,   // 物品名称
    type: item.item.type,   // 物品类型
    price: item.item.price, // 价格
  }));
    return {
    items: flatItems,
    total,
  };
  }

  async getItemDetail(itemId: number) {
    return this.itemRepo.findOne({
      where: { id: itemId },
      relations: ['owner']
    });
  }

  async addItemToInventory(characterId: number, itemId: number, count: number) {
    return this.inventoryRepo.manager.transaction(async (manager) => {
      // 查找是否已有该物品
      const existingItem = await manager.findOne(Inventory, {
        where: {
          character: { id: characterId },
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
          character: { id: characterId },
          item: { id: itemId },
          count
        });
        return manager.save(newItem);
      }
    });
  }

  async removeItemFromInventory(characterId: number, itemId: number, count: number) {
    return this.inventoryRepo.manager.transaction(async (manager) => {
      // 查找物品
      const existingItem = await manager.findOne(Inventory, {
        where: {
          character: { id: characterId },
          item: { id: itemId }
        }
      });
      if (existingItem) {
        // 如果已有则减少数量
        return manager.update(Inventory, existingItem.id, {
          count: existingItem.count - count
        });
      }
    });
  }
}