//NodeJS.process.env.NODE_ENV = 'development';

declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    AWS_REGION: string;
    AWS_ACCESS_KEY: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_S3_BUCKET_NAME: string;
  }
}
