import { Body, Controller, Get, Param, Post,  } from "@nestjs/common";
import { NotificationService } from "./notification.service";

@Controller('inventory')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

}
