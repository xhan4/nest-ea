import { Injectable, CanActivate, ExecutionContext, HttpStatus, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/rules.decorator';
import { UserRole } from 'src/entities/user.entity';


@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!requiredRoles.some(role => user?.roles?.includes(role))) {
      throw new HttpException('无权访问：需要管理员权限', HttpStatus.FORBIDDEN);
    }

    return requiredRoles.some(role => user?.roles?.includes(role));
  }
}
