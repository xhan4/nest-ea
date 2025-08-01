import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trade } from '../../entities/trade.entity';
import { TradeController } from './trade.controller';
import { TradeService } from './trade.service';
import { Inventory } from 'src/entities/inventory.entity';
import { NotifyGateway } from 'src/core/gateway/notify.gateway';
import { User } from 'src/entities/user.entity';
import { Item } from 'src/entities/item.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { MailService } from '../mail/mail.service';
import { Mail } from '../../entities/mail.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Trade, User, Item, Inventory, Transaction, Mail])],
    controllers: [TradeController],
    providers: [TradeService, MailService, NotifyGateway]
})
export class TradeModule {}
