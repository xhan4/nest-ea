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
  async getUserItems(userId: number, page: number = 1,pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
     const [inventoryItems, total] = await this.inventoryRepo.findAndCount({
      where: {
        user: { id: userId },
        item: { isTrading: false }
      },
      relations: ['item'],
      skip,
      take: pageSize
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

  async listItem(userId: number, itemId: number, price: number, count: number) {
    try {
      // 1. 检查库存中是否存在该物品
      const inventoryItem = await this.inventoryRepo.findOne({
        where: {
          user: { id: userId },
          item: { id: itemId }
        }
      });

      if (!inventoryItem) {
        throw new NotFoundException(`库存中不存在物品 ${itemId}`);
      }

      // 2. 检查可用数量是否足够
      const availableCount = inventoryItem.count - inventoryItem.tradingCount;
      if (availableCount < count) {
        throw new ConflictException(`物品 ${itemId} 可用数量不足，当前可用: ${availableCount}`);
      }

      // 3. 执行更新
      const result = await this.inventoryRepo.update(
        { id: inventoryItem.id },
        {
          isTrading: true,
          price,
          lastTradeTime: new Date(),
          tradingCount: inventoryItem.tradingCount + count // 增加交易中数量
        }
      );

      // 4. 处理更新结果
      if (result.affected === 0) {
        throw new InternalServerErrorException('更新失败，请稍后重试');
      }
      return {
        success: true,
        itemId,
        newPrice: price,
        tradingCount: count
      };
    } catch (error) {
      throw error;
    }
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

  async completeTrade(userId: number, itemId: number, count: number, isSuccess: boolean) {
      const inventoryItem = await this.inventoryRepo.findOne({
        where: {
          user: { id: userId },
          item: { id: itemId }
        }
      });
  
      if (!inventoryItem) {
        throw new NotFoundException(`库存中不存在物品 ${itemId}`);
      }
  
      if (inventoryItem.tradingCount < count) {
        throw new ConflictException(`交易中数量不足`);
      }
  
      await this.inventoryRepo.update(
        { id: inventoryItem.id },
        {
          isTrading: inventoryItem.tradingCount - count > 0,
          tradingCount: inventoryItem.tradingCount - count,
          count: isSuccess ? inventoryItem.count - count : inventoryItem.count,
          lastTradeTime: new Date()
        }
      );
  }
}