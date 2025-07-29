import { Module } from '@nestjs/common';
import { SectService } from './sect.service';
import { SectController } from './sect.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sect } from 'src/entities/sect.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sect]) // 添加这行
  ],
  controllers: [SectController],
  providers: [SectService],
})
export class SectModule {}
