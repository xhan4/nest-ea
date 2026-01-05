import { Module } from '@nestjs/common';
import { Sora2Service } from './sora2.service';
import { Sora2Controller } from './sora2.controller';

@Module({
  controllers: [Sora2Controller],
  providers: [Sora2Service],
  exports: [Sora2Service],
})
export class Sora2Module {}
