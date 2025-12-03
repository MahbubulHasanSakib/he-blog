import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  Inject,
  Param,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { ApiConfigService } from '../api-config/api-config.service';
import { UploadBase64FileDto } from './dto/upload-base64-file.dto';
import { FileUploadDto } from './dto/file-upload.dto';
import { BlobServiceClient, BlockBlobClient } from '@azure/storage-blob';
import * as sharp from 'sharp';
import * as FileType from 'file-type';

@ApiBearerAuth()
@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(
    @Inject(BlobServiceClient.name)
    private readonly blobServiceClient: BlobServiceClient,
    private readonly apiConfigService: ApiConfigService,
    private readonly uploadService: UploadService,
  ) {}

  private getContainerClient() {
    const containerName = this.apiConfigService.getAzureContainer;
    return this.blobServiceClient.getContainerClient(containerName);
  }

  private async uploadToBlob(key: string, buffer: Buffer, mimeType: string) {
    const container = this.getContainerClient();
    const blobClient: BlockBlobClient = container.getBlockBlobClient(key);
    await blobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: mimeType },
    });
    return blobClient.url;
  }

  @Post(':folder/:date')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadDto })
  @ApiParam({ name: 'folder', type: 'string', example: 'resource' })
  @ApiParam({ name: 'date', type: 'string', example: '02-02-2024' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadWithThumbnail(
    @Param() param: Record<'folder' | 'date', string>,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 100_000_000 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    const detected = await FileType.fileTypeFromBuffer(file.buffer);
    if (
      !detected ||
      !/(png|jpeg|jpg|pdf|mp4|mpeg|gif|webm|m4a)/i.test(detected.ext)
    ) {
      throw new BadRequestException(
        `Unsupported or invalid file type: ${detected?.ext || 'unknown'}`,
      );
    }

    const basePath = this.apiConfigService.getBasePath;
    const fileKey = `${basePath}/${param.folder}/${param.date}/${file.originalname}`;

    if (/(png|jpeg|jpg)/i.test(file.mimetype)) {
      const originalKey = `${fileKey}-original`;
      const thumbKey = `${fileKey}-thumb`;

      const thumbnailImage = await sharp(file.buffer)
        .resize(200, 200)
        .toBuffer();
      const [originalUrl, thumbUrl] = await Promise.all([
        this.uploadToBlob(originalKey, file.buffer, file.mimetype),
        this.uploadToBlob(thumbKey, thumbnailImage, file.mimetype),
      ]);

      return {
        message: 'Image uploaded successfully.',
        data: { original: originalUrl, thumb: thumbUrl },
      };
    } else {
      const fileUrl = await this.uploadToBlob(
        fileKey,
        file.buffer,
        file.mimetype,
      );
      return { message: 'File uploaded successfully.', data: { fileUrl } };
    }
  }

  @Post('base64/:folder/:date')
  @ApiParam({ name: 'folder', type: 'string', example: 'resource' })
  @ApiParam({ name: 'date', type: 'string', example: '02-02-2024' })
  async uploadBase64File(
    @Param() param: Record<'folder' | 'date', string>,
    @Body() uploadFileDto: UploadBase64FileDto,
  ) {
    const buffer = Buffer.from(uploadFileDto.uri, 'base64');
    const detected = await FileType.fileTypeFromBuffer(buffer);
    console.log(JSON.stringify(detected, null, 4));
    if (
      !detected ||
      !/(png|jpeg|jpg|pdf|mp4|mpeg|gif|webm|m4a|webp)/i.test(detected.ext)
    ) {
      throw new BadRequestException(
        `Unsupported or invalid file type: ${detected?.ext || 'unknown'}`,
      );
    }

    const basePath = this.apiConfigService.getBasePath;
    const fileKey = `${basePath}/${param.folder}/${param.date}/${uploadFileDto.name}`;

    if (/(png|jpeg)/i.test(uploadFileDto.type)) {
      const originalKey = `${fileKey}-original`;
      const thumbKey = `${fileKey}-thumb`;
      const thumbnailImage = await sharp(buffer).resize(200, 200).toBuffer();

      const [originalUrl, thumbUrl] = await Promise.all([
        this.uploadToBlob(originalKey, buffer, uploadFileDto.type),
        this.uploadToBlob(thumbKey, thumbnailImage, uploadFileDto.type),
      ]);

      return {
        message: 'Image uploaded successfully.',
        data: { original: originalUrl, thumb: thumbUrl },
      };
    } else {
      const fileUrl = await this.uploadToBlob(
        fileKey,
        buffer,
        uploadFileDto.type,
      );
      return { message: 'File uploaded successfully.', data: { fileUrl } };
    }
  }
}
