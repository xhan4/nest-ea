import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from '../../entities/inventory.entity';
import { Item } from '../../entities/item.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    @InjectRepository(Item)
    private itemRepo: Repository<Item> // 添加 ItemRepository
  ) {}
  async getUserItems(userId:number){
    return this.itemRepo.find(
       { where:{
            owner:{id:userId},
            isTrading:false
       },
       relations:['owner']
      }
    )
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

}