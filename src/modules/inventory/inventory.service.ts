import { ConflictException, ForbiddenException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  async getUserItems(userId: number, current: number = 1,pagesize: number = 10) {
    const skip = (current - 1) * pagesize;
     const [inventoryItems, total] = await this.inventoryRepo.findAndCount({
      where: {
        user: { id: userId },
        item: { isTrading: false }
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
    isTrading: item.item.isTrading,  // 是否在交易中
    price: item.item.price, // 价格
    lastTradeTime: item.item.lastTradeTime // 最后交易时间
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