import { S3Client } from '@aws-sdk/client-s3';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RekognitionClient } from '@aws-sdk/client-rekognition';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ConfigAwsClient } from '../aws/config.aws';
import { AwsService } from '../aws/aws.service';

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

      return { url };
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
}
