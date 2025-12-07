import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDate, IsMongoId, IsOptional } from 'class-validator';

export class FilterDto {
  @ApiPropertyOptional({ example: new Date() })
  @IsOptional()
  @IsDate()
  from: Date;

  @ApiPropertyOptional({ example: new Date() })
  @IsOptional()
  @IsDate()
  to: Date;
}
