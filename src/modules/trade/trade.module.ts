import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trade } from '../../entities/trade.entity';
import { TradeController } from './trade.controller';
import { TradeService } from './trade.service';
@Module({
  imports:[TypeOrmModule.forFeature([Trade])],
  controllers: [TradeController],
  providers:[TradeService]
})
export class TradeModule {}
