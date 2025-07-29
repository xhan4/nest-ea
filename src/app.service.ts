import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getServerTime(): { time: string; timestamp: number } {
    const now = new Date();
    return {
      time: now.toISOString(),
      timestamp: now.getTime()
    };
  }
}
