import { Module } from '@nestjs/common';
import { FarmService } from './farm.service';
import { FarmController } from './farm.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plot } from 'src/entities/plot.entity';
import { Plant } from 'src/entities/plant.entity';
import { Inventory } from 'src/entities/inventory.entity';
import { Sect } from 'src/entities/sect.entity';
import { NotifyGateway } from '../mail/notify.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Plot,Plant,Inventory,Sect])],
  controllers: [FarmController],
  providers: [FarmService,NotifyGateway],
})
export class FarmModule {}