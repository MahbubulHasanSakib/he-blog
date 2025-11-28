import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ApiConfigModule } from '../api-config/api-config.module';
import { ApiConfigService } from '../api-config/api-config.service';
import { BlobServiceClient } from '@azure/storage-blob';

@Module({
  imports: [ApiConfigModule],
  controllers: [UploadController],
  providers: [
    UploadService,
    {
      provide: BlobServiceClient.name,
      useFactory: (apiConfigService: ApiConfigService) => {
        return BlobServiceClient.fromConnectionString(
          apiConfigService.getAzureConnectionString,
        );
      },
      inject: [ApiConfigService],
    },
  ],
  exports: [UploadService],
})
export class UploadModule {}
