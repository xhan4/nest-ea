import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsService } from './points.service';
import { User } from '../../entities/user.entity';
import { PointsRecord } from '../../entities/points-record.entity';
import { PointsController } from './points.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, PointsRecord])],
  controllers: [PointsController],
  providers: [PointsService],
  exports: [PointsService],
})
export class PointsModule {}