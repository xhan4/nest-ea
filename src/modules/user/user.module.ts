import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entiry/user.entity';
import { UserService } from './user.service';
import { APP_GUARD } from '@nestjs/core';
import { UserGuard } from './user.guard';

@Module({
  imports:[TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers:[UserService,
    {
      provide: APP_GUARD,
      useClass: UserGuard,
    },
  ]
})
export class UserModule {}
