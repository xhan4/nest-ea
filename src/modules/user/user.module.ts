import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { UserService } from './user.service';
import { PointsModule } from '../points/points.module';
@Module({
  imports: [TypeOrmModule.forFeature([User]), PointsModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}