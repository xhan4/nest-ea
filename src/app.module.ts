import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import envConfig from '../config/env';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './core/auth/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ItemModule } from './modules/item/item.module';
import { MailModule } from './modules/mail/mail.module';
import { TradeModule } from './modules/trade/trade.module';
import { Inventory } from './entities/inventory.entity';
import { Item } from './entities/item.entity';
import { Trade } from './entities/trade.entity';
import { Mail } from './entities/mail.entity';
import { Transaction } from './entities/transaction.entity';
import { RolesGuard } from './core/auth/roles.guard';
import { Character } from './entities/character.entity';
import { SectMember } from './entities/sect-member.entity';
import { Sect } from './entities/sect.entity';
import { SpiritualField } from './entities/spiritual-field.entity';
import { CharacterModule } from './modules/character/character.module';
import { SectModule } from './modules/sect/sect.module';
import { PendMember } from './entities/pending-member.entity';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 设置为全局
      envFilePath: [envConfig.path],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql', // 数据库类型
        entities: [User, Inventory, Item, Mail, Trade, Transaction,Character,Sect,SectMember,SpiritualField,PendMember], // 数据表实体，synchronize为true时，自动创建表，生产环境建议关闭
        host: configService.get('DB_HOST'), // 主机，默认为localhost
        port: configService.get<number>('DB_PORT'), // 端口号
        username: configService.get('DB_USER'), // 用户名
        password: configService.get('DB_PASSWD'), // 密码
        database: configService.get('DB_DATABASE'), //数据库名
        timezone: '+08:00', //服务器上配置的时区
        synchronize: true, //根据实体自动创建数据库表， 生产环境建议关闭
        poolSize: 20,  
      })

    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: configService.get('JWT_EXP'),
          },
        };
      },
    }),
    UserModule,
    InventoryModule,
    ItemModule,
    MailModule,
    TradeModule,
    CharacterModule,
    SectModule,
  ],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_GUARD,
    useClass: AuthGuard,
  },
   {
      provide: APP_GUARD,
      useClass: RolesGuard, 
    }
],
})
export class AppModule { }
