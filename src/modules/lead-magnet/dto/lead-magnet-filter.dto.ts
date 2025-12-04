import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { PaginateDto } from 'src/utils/dto/paginate.dto';
import { Transform } from 'class-transformer';

export class LeadMagnetFilterDto extends PaginateDto {
  @ApiPropertyOptional({ description: 'Search by post title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Search by post type' })
  @IsString()
  @IsOptional()
  type?: string;
}
