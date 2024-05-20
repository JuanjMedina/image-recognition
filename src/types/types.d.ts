interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
}

export interface ConfigAwsClientType {
  region: string;
  credentials: AwsCredentials;
}
