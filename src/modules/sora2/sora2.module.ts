import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sora2Service } from './sora2.service';
import { Sora2Controller } from './sora2.controller';
import { User } from '../../entities/user.entity';
import { PointsModule } from '../points/points.module';
import { VideoRecordModule } from '../video-record/video-record.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PointsModule,
    VideoRecordModule,
  ],
  controllers: [Sora2Controller],
  providers: [Sora2Service],
  exports: [Sora2Service],
})
export class Sora2Module {}