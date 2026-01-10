import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
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
import { Mail } from './entities/mail.entity';
import { MailModule } from './modules/mail/mail.module';
import { RolesGuard } from './core/auth/roles.guard';
import { Sora2Module } from './modules/sora2/sora2.module';
import { PointsModule } from './modules/points/points.module';
import { VideoRecordModule } from './modules/video-record/video-record.module';
import { PointsRecord } from './entities/points-record.entity';
import { VideoRecord } from './entities/video-record.entity';
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
        entities: [User, Mail, PointsRecord, VideoRecord], // 数据表实体，synchronize为true时，自动创建表，生产环境建议关闭
        host: configService.get('DB_HOST'), // 主机，默认为localhost
        port: configService.get<number>('DB_PORT'), // 端口号
        username: configService.get('DB_USER'), // 用户名
        password: configService.get('DB_PASSWD'), // 密码
        database: configService.get('DB_DATABASE'), //数据库名
        timezone: '+08:00', //服务器上配置的时区
        synchronize: true, //根据实体自动创建数据库表， 生产环境建议关闭
        // 使用正确的MySQL2连接池配置
        extra: {
          connectionLimit: 20,          // 连接池最大连接数
          // 移除了无效的 acquireTimeout 和 timeout 选项
          // 添加以下选项以提高连接稳定性
          enableKeepAlive: true,        // 启用TCP keep-alive
          keepAliveInitialDelay: 0,     // keep-alive初始延迟
        }
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
    MailModule,
    Sora2Module,
    PointsModule,
    VideoRecordModule,
    ScheduleModule.forRoot(),
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