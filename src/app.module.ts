import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RecognitionModule } from './recognition/recognition.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    RecognitionModule,
  ],
})
export class AppModule {}
