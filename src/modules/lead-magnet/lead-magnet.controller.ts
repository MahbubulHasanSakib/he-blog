import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { LeadMagnetService } from './lead-magnet.service';
import { CreateLeadMagnetDto } from './dto/create-lead-magnet.dto';
import { UpdateLeadMagnetDto } from './dto/update-lead-magnet.dto';
import { ApiTags } from '@nestjs/swagger';
import { ResponseInterceptor } from 'src/utils/response.interceptor';

@ApiTags('lead-magnet')
@UseInterceptors(ResponseInterceptor)
@Controller('lead-magnet')
export class LeadMagnetController {
  constructor(private readonly leadMagnetService: LeadMagnetService) {}

  @Post()
  create(@Body() createLeadMagnetDto: CreateLeadMagnetDto) {
    return this.leadMagnetService.create(createLeadMagnetDto);
  }

  @Get()
  findAll() {
    return this.leadMagnetService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadMagnetService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLeadMagnetDto: UpdateLeadMagnetDto,
  ) {
    return this.leadMagnetService.update(id, updateLeadMagnetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leadMagnetService.remove(id);
  }
}
