import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

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
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({
    example: 'pdf',
    description: 'File type such as pdf, jpg, png',
  })
  @IsString()
  @IsNotEmpty()
  fileType: string;
}
