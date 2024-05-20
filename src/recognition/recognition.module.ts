import { Module } from '@nestjs/common';
import { RecognitionController } from './controller/recognition.controller';
import { RecognitionService } from './service/recognition.service';

@Module({
  controllers: [RecognitionController],
  providers: [RecognitionService],
})
export class RecognitionModule {}
