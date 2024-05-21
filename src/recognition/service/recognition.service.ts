import { S3Client } from '@aws-sdk/client-s3';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RekognitionClient } from '@aws-sdk/client-rekognition';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ConfigAwsClient } from '../aws/config.aws';
import { AwsService } from '../aws/aws.service';
import { ScanCommandOutput } from '@aws-sdk/lib-dynamodb';

@Injectable()
export class RecognitionService {
  private readonly s3Client = new S3Client(ConfigAwsClient);
  private readonly rekognitionClient = new RekognitionClient(ConfigAwsClient);
  private readonly dynamoDbClient = new DynamoDBClient(ConfigAwsClient);
  private readonly amazonService = new AwsService();

  async analyzeImageRekognition(fileName: string) {
    try {
      const putToRekognition =
        this.amazonService.createObjectRekognition(fileName);
      const responseKognito =
        await this.rekognitionClient.send(putToRekognition);
      return responseKognito.Labels.map((label) => label.Name);
    } catch (err) {
      console.log(err);
      throw new HttpException('Forbidden', HttpStatus.BAD_REQUEST);
    }
  }

  async putToDynamoDb(url: string, labels: string[]) {
    try {
      const putToDynamoDb = this.amazonService.createObjectDynamoDb(
        url,
        labels,
      );
      return await this.dynamoDbClient.send(putToDynamoDb);
    } catch (err) {
      console.log(err);
      throw new HttpException('Forbidden', HttpStatus.BAD_REQUEST);
    }
  }

  async uploadImage(fileName: string, fileBuffer: string) {
    try {
      const { putToS3, url } = this.amazonService.createObjectS3(
        fileName,
        fileBuffer,
      );
      await this.s3Client.send(putToS3);

      const labelAmazonKognito = await this.analyzeImageRekognition(fileName);

      await this.putToDynamoDb(url, labelAmazonKognito);

      return { url, labels: labelAmazonKognito };
    } catch (err) {
      console.log(err);
      throw new HttpException(
        'Error al pedir el recurso',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAllImages(word: string) {
    try {
      const putToDynamoDB = this.amazonService.getObjectDynamoDB(word);
      return await this.dynamoDbClient.send(putToDynamoDB);
    } catch (e) {
      console.log(e);
      throw new HttpException(
        'Error al pedir el recurso',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAllCategorys() {
    try {
      const putToDynamoDBCommand = this.amazonService.getAllDataDynamoDB();
      const allDataResponseDynamo = (await this.dynamoDbClient.send(
        putToDynamoDBCommand,
      )) as ScanCommandOutput;

      const categorys = new Set();
      allDataResponseDynamo.Items.forEach((item) => {
        if (item.labels.L) {
          item.labels.L.map((Category) => categorys.add(Category.S));
        }
      });
      return Array.from(categorys);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error al pedir el recurso',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAllImagesByCategories(categories: string[]) {
    try {
      const putToDynamoDBCommand =
        this.amazonService.getAllImagesByCategories(categories);
      const getAllDataByCategories =
        await this.dynamoDbClient.send(putToDynamoDBCommand);
      return [...getAllDataByCategories.Items];
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error al pedir el recurso',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
