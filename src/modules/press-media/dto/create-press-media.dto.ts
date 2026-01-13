import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePressMediaDto {
  @ApiProperty({
    description: 'URL or path of the image',
    example: 'https://example.com/images/press1.jpg',
  })
  @IsNotEmpty()
  @IsString()
  image: string;

  @ApiProperty({
    description: 'Alternative text for the image',
    example: 'CEO speaking at product launch',
  })
  @IsNotEmpty()
  @IsString()
  image_alt: string;

  @ApiProperty({
    description: 'Brief summary of the press/media item',
    example: 'Our CEO announced the launch of our new product line today.',
  })
  @IsNotEmpty()
  @IsString()
  short_summary: string;

  @ApiProperty({
    description: 'Full article or media link',
    example: 'https://example.com/press/new-product-launch',
  })
  @IsNotEmpty()
  @IsUrl()
  link: string;
}
