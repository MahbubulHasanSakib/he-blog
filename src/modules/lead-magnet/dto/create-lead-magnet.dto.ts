import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class ImageDto {
  @IsUrl()
  @ApiProperty()
  original: string;

  @IsUrl()
  @ApiProperty()
  thumb: string;
}

export class CreateLeadMagnetDto {
  @ApiProperty({
    example: 'Ultimate Marketing Growth Guide',
    description: 'Title of the lead magnet',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example:
      'A complete step-by-step guide to boost your marketing conversions.',
    description: 'Short description of the lead magnet',
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    example: 'https://cdn.example.com/files/marketing-guide.pdf',
    description: 'Public URL of the file',
  })
  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @ApiProperty({
    example: 'marketing-guide.pdf',
    description: 'Original uploaded file name',
  })
  @IsString()
  @IsOptional()
  fileName: string;

  @ApiProperty({
    example: 'pdf',
    description: 'File type such as pdf, jpg, png',
  })
  @IsString()
  @IsOptional()
  fileType: string;

  @ApiProperty({ type: ImageDto, required: false })
  @Type(() => ImageDto)
  @ValidateNested()
  @IsOptional()
  image: ImageDto;

  @ApiProperty({
    example: 'dynamic',
  })
  @IsString()
  @IsOptional()
  type: string;

  @ApiProperty({
    example: 'buttonOneText',
  })
  @IsString()
  @IsNotEmpty()
  buttonOneText: string;

  @ApiProperty({
    example: 'buttonTwoText',
  })
  @IsString()
  @IsOptional()
  buttonTwoText: string;

  @ApiProperty({
    example: 'buttonTwoLink',
  })
  @IsString()
  @IsOptional()
  buttonTwoLink: string;
}
