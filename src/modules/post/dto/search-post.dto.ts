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
import { PostStatus } from '../interface/post-status.type';

export class SearchPost extends PaginateDto {
  @ApiPropertyOptional({ enum: PostStatus })
  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;

  @ApiPropertyOptional({ description: 'Author ID of the post' })
  @IsMongoId()
  @IsOptional()
  authorId?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Filter by category IDs',
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  categories?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Filter by tag IDs' })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Search by post title' })
  @IsString()
  @IsOptional()
  title?: string;
}
