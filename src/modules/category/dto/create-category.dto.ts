import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Technology',
    description: 'Category name',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 'technology',
    description: 'Custom slug (optional). Will be auto-generated if missing.',
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({
    example: 'All articles related to technology and innovation.',
    description: 'Short description of the category.',
  })
  @IsString()
  @IsOptional()
  @MaxLength(300)
  description?: string;
}
