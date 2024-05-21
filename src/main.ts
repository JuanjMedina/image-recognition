import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(morgan('dev'));
  app.setGlobalPrefix('api');
  const configService = app.get(ConfigService);
  await app.listen(configService.get('PORT'));
  console.log(`PORT ${configService.get('PORT')}`);
  console.log(`Application running on : ${await app.getUrl()}`);
}
bootstrap();
