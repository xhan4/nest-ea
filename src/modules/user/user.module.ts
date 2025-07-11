import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { UserService } from './user.service';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from 'src/core/auth/roles.guard';
@Module({
  imports:[TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers:[UserService,{
      provide: APP_GUARD,
      useClass: RolesGuard,
    }],
})
export class UserModule {}
