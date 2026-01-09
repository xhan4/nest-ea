import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsService } from './points.service';
import { User } from '../../entities/user.entity';
import { PointsRecord } from '../../entities/points-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, PointsRecord])],
  providers: [PointsService],
  exports: [PointsService],
})
export class PointsModule {}