import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // <-- Import ApiProperty

export class CreateLeadMagnetRequestDto {
  // --- User Contact Details ---

  @ApiProperty({
    example: 'john.doe@corporate.com',
    description: 'The email address where the lead magnet document will be sent.',
    required: true,
  })
  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Must be a valid email address.' })
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the requester.',
    required: true,
  })
  @IsNotEmpty({ message: 'Full Name is required.' })
  @IsString()
  fullName: string;

  // --- User Business Details (Optional) ---

  @ApiProperty({
    example: 'Acme Corp',
    description: 'The company name of the requester.',
    required: false,
  })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({
    example: '555-123-4567',
    description: 'The requester\'s contact phone number.',
    required: false,
  })
  @IsOptional()
  @IsString()
  contactNo?: string;


  @ApiProperty({
    example: '2024-Q3-Report.pdf',
    description: 'The intended file name of the lead magnet document (used in the email attachment).',
    required: true,
  })
  @IsNotEmpty({ message: 'Requested file name is required.' })
  @IsString()
  fileName: string;

  @ApiProperty({
    example: 'https://blbucket.blob.core.windows.net/bl-bucket/.../report-file-id-original',
    description: 'The publicly accessible URL pointing to the actual lead magnet file.',
    required: true,
  })
  @IsNotEmpty({ message: 'Source file URL is required.' })
  @IsUrl({}, { message: 'Must be a valid URL for the source file.' })
  fileUrl: string;
}