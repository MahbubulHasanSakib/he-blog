import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({
    example: 'NestJS',
    description: 'Tag name',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({
    example: 'nestjs',
    description: 'Custom slug (optional). Will be auto-generated if missing.',
  })
  @IsString()
  @IsOptional()
  slug?: string;
}
