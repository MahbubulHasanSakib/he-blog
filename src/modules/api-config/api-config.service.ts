import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  get getMongodbUri(): string {
    return this.configService.get('MONGODB_URI');
  }
  get getPort(): number {
    return this.configService.get('PORT');
  }

  get getJwtSecret(): string {
    return this.configService.get('JWT_SECRET');
  }

  get getJwtExpire(): string {
    return this.configService.get('JWT_EXPIRE');
  }

  get getJwtRefreshSecret(): string {
    return this.configService.get('JWT_REFRESH_SECRET');
  }

  get getJwtRefreshExpire(): string {
    return this.configService.get('JWT_REFRESH_EXPIRE');
  }

  get getAzureConnectionString(): string {
    return this.configService.get('AZURE_STORAGE_CONNECTION_STRING');
  }

  get getAzureContainer(): string {
    return this.configService.get('AZURE_STORAGE_CONTAINER');
  }

  get getAzureAccountKey(): string {
    return this.configService.get('AZURE_ACCOUNT_KEY');
  }

  get getBasePath() {
    return this.configService.get('BASE_PATH');
  }

  get getDocsUserName() {
    return this.configService.get('DOCS_USERNAME');
  }

   get getDocsPassword() {
    return this.configService.get('DOCS_PASSWORD');
  }

  
  get getEmailHost(): string {
    return this.configService.get('EMAIL_HOST');
  }

  get getEmailUser(): string {
    return this.configService.get('EMAIL_USER');
  }

  get getEmailPassword(): string {
    return this.configService.get('EMAIL_PASS');
  }

  get getEmailPort(): number {
    return this.configService.get('EMAIL_PORT');
  }
}
