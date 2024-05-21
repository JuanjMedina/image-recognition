import { S3ClientConfig } from '@aws-sdk/client-s3';
import { ConfigModule, ConfigService } from '@nestjs/config';
const pathENV = process.env.NODE_ENV.trim();
ConfigModule.forRoot({
  envFilePath: `${pathENV}.env`,
  isGlobal: true,
});

const configService = new ConfigService();

export const ConfigAwsClient: S3ClientConfig = {
  region: configService.get('AWS_REGION'),
  credentials: {
    accessKeyId: configService.get('AWS_ACCESS_KEY'),
    secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
  },
};
