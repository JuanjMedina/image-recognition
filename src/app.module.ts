import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RecognitionModule } from './recognition/recognition.module';
import { AppController } from './app.controller';
import { AppService } from './app.services';

console.log(`NODE_ENV ${process.env.NODE_ENV.trim()}`);
const pathENV = process.env.NODE_ENV.trim();

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `development.env`,
      isGlobal: true,
    }),
    RecognitionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
