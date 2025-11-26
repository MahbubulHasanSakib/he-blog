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
}
