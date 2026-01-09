import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoRecordService } from './video-record.service';
import { VideoRecord } from '../../entities/video-record.entity';
import { User } from '../../entities/user.entity';
import { PointsModule } from '../points/points.module';

@Module({
  imports: [TypeOrmModule.forFeature([VideoRecord, User]), PointsModule],
  providers: [VideoRecordService],
  exports: [VideoRecordService],
})
export class VideoRecordModule {}