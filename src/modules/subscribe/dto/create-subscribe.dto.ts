import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class CreateSubscribeDto {
  @ApiProperty({ example: 'mahbubulhasan179@gmail.com' })
  @IsEmail()
  email: string;
}
