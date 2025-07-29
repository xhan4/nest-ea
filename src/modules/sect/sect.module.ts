import { Module } from '@nestjs/common';
import { SectService } from './sect.service';
import { SectController } from './sect.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sect } from 'src/entities/sect.entity';
import { PendMember } from 'src/entities/pending-member.entity';
import { SectMember } from 'src/entities/sect-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sect,PendMember,SectMember]) // 添加这行
  ],
  controllers: [SectController],
  providers: [SectService],
})
export class SectModule {}
