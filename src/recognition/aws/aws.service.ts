import { PutItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { DetectLabelsCommand } from '@aws-sdk/client-rekognition';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigModule, ConfigService } from '@nestjs/config';

const pathENV = process.env.NODE_ENV.trim();
ConfigModule.forRoot({
  envFilePath: `${pathENV}.env`,
  isGlobal: true,
});

const configService = new ConfigService();
export class AwsService {
  createObjectS3(fileName: string, fileBuffer: string) {
    const putToS3 = new PutObjectCommand({
      Bucket: configService.get('AWS_S3_BUCKET_NAME'),
      Key: fileName,
      Body: fileBuffer,
    });
    const url = `https://${configService.get('AWS_S3_BUCKET_NAME')}.s3.amazonaws.com/${fileName}`;
    return { putToS3, url };
  }
  createObjectRekognition(fileName: string) {
    return new DetectLabelsCommand({
      Image: {
        S3Object: {
          Bucket: configService.get('AWS_S3_BUCKET_NAME'),
          Name: fileName,
        },
      },
    });
  }
  createObjectDynamoDb(url: string, labels: string[]) {
    return new PutItemCommand({
      TableName: configService.get('AWS_DYNAMODB_TABLE_NAME'),
      Item: {
        imageid: { S: crypto.randomUUID() },
        url: { S: url },
        labels: { L: labels.map((label) => ({ S: label })) },
      },
    });
  }
  getObjectDynamoDB(word: string) {
    return new ScanCommand({
      TableName: configService.get('AWS_DYNAMODB_TABLE_NAME'),
      FilterExpression: 'contains(labels, :label)',
      ExpressionAttributeValues: { ':label': { S: `${word}` } },
    });
  }

  getAllDataDynamoDB() {
    return new ScanCommand({
      TableName: configService.get('AWS_DYNAMODB_TABLE_NAME'),
    });
  }

  getAllImagesByCategories(categories: string[]) {
    const filterExpressionText = categories
      .map((category, index) => `contains(labels, :label${index})`)
      .join(' AND ');
    const expressionFilterText = categories.reduce(
      (acc, curr, idx) => ({
        ...acc,
        [`:label${idx}`]: {
          S: `${curr}`,
        },
      }),
      {},
    );
    return new ScanCommand({
      TableName: configService.get('AWS_DYNAMODB_TABLE_NAME'),
      FilterExpression: filterExpressionText,
      ExpressionAttributeValues: {
        ...expressionFilterText,
      },
    });
  }
}
