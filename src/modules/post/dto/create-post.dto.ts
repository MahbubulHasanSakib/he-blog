import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsEnum,
  IsMongoId,
  MaxLength,
  IsDateString,
  MinLength,
  IsDate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PostStatus } from '../interface/post-status.type';

export class CreatePostDto {
  @ApiProperty({
    example: 'Migrating to AI-Powered Trade Merchandising: A 101 Guide',
    description: 'The main title of the blog post.',
    minLength: 5,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 'migrating-to-ai-powered-trade-merchandising-101',
    description:
      'URL-friendly slug. If optional, the service will generate it from the title.',
    required: false,
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    example:
      "<h2>Introduction</h2><p>HawkEyes' AI platforms revolutionize...</p>",
    description: 'The full HTML or Markdown content of the post.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example:
      "HawkEyes' AI platforms revolutionize trade merchandising by automating field sales...",
    description: 'Short summary or excerpt of the post content.',
    required: false,
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  excerpt?: string;

  // @ApiProperty({
  //   example: '654321098765432109876543',
  //   description:
  //     'The MongoDB ObjectId of the author. This should ideally be set by the server from the authenticated user.',
  // })
  // @IsString()
  // @IsNotEmpty()
  // // This should be the authenticated user's ID passed by the Auth Guard
  // authorId: string;

  @ApiProperty({
    example:
      'https://placehold.co/1200x600/000000/FFFFFF/png?text=Featured+Image',
    description: 'URL to the main featured image for the post.',
    required: false,
  })
  @IsString()
  @IsOptional()
  featuredImageUrl?: string;

  @ApiProperty({
    type: [String],
    example: ['654321098765432109871111', '654321098765432109872222'],
    description: 'Array of MongoDB ObjectIds referencing Categories.',
    required: false,
  })
  @IsArray()
  @IsOptional()
  // Array of MongoDB Category IDs
  @IsMongoId({ each: true })
  categories?: string[];

  @ApiProperty({
    type: [String],
    example: ['Trade Merchandising', 'AI', 'Field Sales Automation'],
    description: 'Array of  Tags.',
    required: false,
  })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    enum: PostStatus,
    example: PostStatus.DRAFT,
    description:
      'The publication status of the post (Draft, Published, Scheduled).',
    required: false,
  })
  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;

  @ApiProperty({
    type: [String],
    example: ['654321098765432109871111', '654321098765432109872222'],
    description: 'Array of MongoDB ObjectIds referencing Categories.',
    required: false,
  })
  @IsArray()
  @IsOptional()
  // Array of MongoDB Category IDs
  @IsMongoId({ each: true })
  contributors?: string[];
}
