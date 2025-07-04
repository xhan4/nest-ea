import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from '../../entities/inventory.entity';
import { Item } from '../../entities/item.entity';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inventory, Item]) // 添加 Item 实体
  ],
  controllers: [InventoryController],
  providers: [InventoryService]
})
export class InventoryModule {}
