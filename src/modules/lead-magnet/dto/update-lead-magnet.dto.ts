import { PartialType } from '@nestjs/mapped-types';
import { CreateLeadMagnetDto } from './create-lead-magnet.dto';

export class UpdateLeadMagnetDto extends PartialType(CreateLeadMagnetDto) {}
