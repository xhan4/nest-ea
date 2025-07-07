import { Module } from '@nestjs/common';
import { NotifyGateway } from './notify.gateway';

@Module({
  providers: [NotifyGateway],
  exports: [NotifyGateway], // 导出 NotifyGateway 供其他模块使用
})
export class NotifyModule {}
