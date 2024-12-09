import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/filter/http-exception/http-exception.filter';
import { TransformInterceptor } from './core/interceptor/transform/transform.interceptor';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app:any = await NestFactory.create(AppModule);
      // 注册全局错误的过滤器
     app.useGlobalFilters(new HttpExceptionFilter());
      // 全局注册拦截器
     app.useGlobalInterceptors(new TransformInterceptor());
     app.useGlobalPipes(new ValidationPipe())
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
