import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ImageDto {
  @IsUrl()
  @ApiProperty()
  original: string;

  @IsUrl()
  @ApiProperty()
  thumb: string;
}
export class CreateUserDto {
  @ApiProperty({
    example: 'john.doe@hawkeyes.com',
    description: 'The unique email address of the new user.',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: "The user's password. Must be at least 8 characters long.",
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the user (Optional).',
    required: false,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ type: ImageDto, required: false })
  @Type(() => ImageDto)
  @ValidateNested()
  @IsOptional()
  image: ImageDto;
}
