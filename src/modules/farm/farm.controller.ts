import { Body, Controller, Post, Get, Param, Query } from '@nestjs/common';
import { FarmService } from './farm.service';
import { CreatePlotDto } from './dto/create-plot.dto';
import { PlantSeedDto } from './dto/plant-seed.dto';
import { HarvestDto } from './dto/harves.dto';

@Controller('farm')
export class FarmController {
  constructor(private readonly farmService: FarmService) {}
 
  @Post('cultivate')
  async cultivatePlot(@Body() createPlotDto: CreatePlotDto) {
    return this.farmService.cultivatePlot(createPlotDto.sectId,createPlotDto.position);
  }

  @Post('plant_seed')
  async plantSeed(@Body() plantSeedDto: PlantSeedDto) {
    return this.farmService.plantSeed(plantSeedDto.sectId, plantSeedDto.plotId, plantSeedDto.seedId);
  }
   
  @Post('harvest')
  async harvest(@Body() harvestDto: HarvestDto) {
    return this.farmService.harvestPlot(harvestDto.characterId, harvestDto.sectId,harvestDto.plotId);
  }
  
  @Get('plot_list')
  async getPlotsBySectId(@Query('sectId') sectId: number) {
    return this.farmService.getPlotsBySectId(sectId);
  }
}