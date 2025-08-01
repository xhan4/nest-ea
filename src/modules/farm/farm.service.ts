import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Plot } from '../../entities/plot.entity';
import { Plant } from '../../entities/plant.entity';
import { Inventory } from '../../entities/inventory.entity';
import { ItemType } from 'src/core/enums/item-type.enum';
import { GrowthStatus } from 'src/core/enums/grow.enum';
import { NotifyGateway } from 'src/core/gateway/notify.gateway';
import { EventType } from 'src/core/enums/event.enum';

@Injectable()
export class FarmService {
  constructor(
    @InjectRepository(Plot) private plotRepository: Repository<Plot>,
    @InjectRepository(Plant) private plantRepository: Repository<Plant>,
    @InjectRepository(Inventory) private inventoryRepository: Repository<Inventory>,
    private notifyGateway: NotifyGateway,
  ) { }

  async cultivatePlot(sectId: number,position:{x:number,y:number}): Promise<Plot> {

      const plot = this.plotRepository.create({
        sect:{id:sectId},
        status:'unlocked',
        positionX:position.x,
        positionY:position.y
      })
    return this.plotRepository.save(plot);
  }

  async plantSeed(sectId: number, plotId: number, seedId: number): Promise<Plant> {
    const plot = await this.plotRepository.findOne({
      where: { id: plotId, sect: { id: sectId }, status: 'unlocked' },
      relations: ['plant'],
    });
    if (!plot) {
      throw new NotFoundException('地块不存在');
    }
    if (plot.plant) {
      throw new BadRequestException('该地块已种植作物');
    }
    const inventoryItem = await this.inventoryRepository.findOne({
      where: { sect: { id: sectId }, item: {id:seedId,type:ItemType.SEED},  },

    });
    if (!inventoryItem || inventoryItem.count <= 0) {
      throw new BadRequestException('仓库中没有足够的种子');
    }

    inventoryItem.count -= 1;
    await this.inventoryRepository.save(inventoryItem);

    const plant = this.plantRepository.create({
      plot,
      seed:{id:seedId,type:ItemType.SEED},
      plantedAt: new Date(),
      growthStatus: GrowthStatus.GROWING, 
      growthProgress: 0, 
      expectedHarvestTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    return this.plantRepository.save(plant);
  }

  async harvestPlot(characterId:number,sectId: number, plotId: number): Promise<Inventory> {
    const plot = await this.plotRepository.findOne({
      where: { id: plotId, sect: { id: sectId } },
      relations: ['plant','plant.seed'],
    });
    if (!plot || !plot.plant) {
      throw new NotFoundException('地块不存在或未种植作物');
    }

    const plant = plot.plant;

    if (new Date() < plant.expectedHarvestTime) {
      throw new BadRequestException('作物尚未成熟');
    }

    const cropItemId = plant.seed.grown.id; 
    const cropItem = plant.seed.grown;

    let inventoryItem = await this.inventoryRepository.findOne({
      where: { sect: { id: sectId }, item: {id:cropItemId,type:ItemType.PLANT},  },
    });

    if (!inventoryItem) {
      inventoryItem = this.inventoryRepository.create({
        sect: { id: sectId },
        character:{id:characterId},
        item: cropItem,
        count: 1,
      });
    } else {
      inventoryItem.count += 1;
    }

    await this.inventoryRepository.save(inventoryItem);

    await this.plantRepository.remove(plant);

    return inventoryItem;
  }

  async getPlotsBySectId(sectId: number) {
    return this.plotRepository.find({
      where: { sect: { id: sectId } },
      relations: ['plant', 'plant.seed'],
    });
  }

  @Cron('0 * * * *') 
  async updatePlantGrowth() {
    const growingPlants = await this.plantRepository.find({
      where: { growthStatus: Not(GrowthStatus.HARVESTED) },
      relations: ['plot'],
    });

    for (const plant of growingPlants) {
      const now = new Date();
      const growthTime = plant.expectedHarvestTime.getTime() - plant.plantedAt.getTime();
      const elapsedTime = now.getTime() - plant.plantedAt.getTime();
      plant.growthProgress = Math.min(100, (elapsedTime / growthTime) * 100);

      if (plant.growthProgress >= 100) {
        plant.growthStatus = GrowthStatus.HARVESTED;
      } else if (plant.growthProgress >= 10) {
        plant.growthStatus = GrowthStatus.GROWING; 
      } else {
        plant.growthStatus = GrowthStatus.SEED;
      }
      await this.plantRepository.save(plant);
      this.notifyGateway.server.to(`${plant.plot.sect.founder.id}`).emit(EventType.PLANT_GROWTH, plant);
    }
  }
}