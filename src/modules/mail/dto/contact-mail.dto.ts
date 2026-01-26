import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactMailDto {
  @ApiProperty({
    description: 'Full name of the contact person',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'Name of the company',
    example: 'Acme Corporation',
  })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({
    description: 'Email address of the contact',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  userEmail: string;

  @ApiPropertyOptional({
    description: 'Service required by the client',
    example: 'Web Development',
  })
  @IsOptional()
  serviceRequired?: string;

  @ApiPropertyOptional({
    description: 'Estimated project budget',
    example: '100000',
  })
  @IsOptional()
  projectBudget?: string;

  @ApiProperty({
    description: 'Details about the project',
    example: 'We want to build an e-commerce website with payment integration.',
  })
  @IsString()
  @IsNotEmpty()
  projectDetails: string;

  @ApiProperty({
    description: 'Phone no.',
    example: '+8801812345695',
  })
  @IsOptional()
  phone: string;
}
