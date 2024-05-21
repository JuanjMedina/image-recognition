import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RecognitionService } from '../service/recognition.service';

@Controller('recognition')
export class RecognitionController {
  constructor(private readonly recognitionService: RecognitionService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file) {
    const response = await this.recognitionService.uploadImage(
      file.originalname,
      file.buffer,
    );
    return { message: ' Archivo Cargado ', data: response };
  }

  @Get('image/:word')
  async getImages(@Param('word') word: string) {
    return this.recognitionService.getAllImages(word);
  }

  @Get('categorys')
  async getAllCategorys() {
    return this.recognitionService.getAllCategorys();
  }
  @Get('query')
  getQuery(@Query('categories') query: string) {
    const categories: string[] = JSON.parse(query);
    return this.recognitionService.getAllImagesByCategories(categories);
  }
}
