import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNumber, IsOptional, Min } from 'class-validator';

import { FilterDto } from 'src/utils/dto/filter.dto';

export class FilterReportDto extends FilterDto {
  @ApiProperty({
    required: false,
    example: '66c5baa4d405d632c4685e19',
  })
  @IsMongoId()
  @IsOptional()
  leadMagnetId: string;

  @ApiProperty({ required: true })
  @IsNumber()
  @Min(0)
  index: number = 0;
}
