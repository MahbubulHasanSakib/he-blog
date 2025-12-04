import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { LeadMagnetService } from './lead-magnet.service';
import { CreateLeadMagnetDto } from './dto/create-lead-magnet.dto';
import { UpdateLeadMagnetDto } from './dto/update-lead-magnet.dto';
import { ApiTags } from '@nestjs/swagger';
import { ResponseInterceptor } from 'src/utils/response.interceptor';
import { CreateLeadMagnetRequestDto } from './dto/create-lead-magnet-request.dto';
import { LeadMagnetFilterDto } from './dto/lead-magnet-filter.dto';

@ApiTags('lead-magnet')
@UseInterceptors(ResponseInterceptor)
@Controller('lead-magnet')
export class LeadMagnetController {
  constructor(private readonly leadMagnetService: LeadMagnetService) {}

  @Post()
  create(@Body() createLeadMagnetDto: CreateLeadMagnetDto) {
    return this.leadMagnetService.create(createLeadMagnetDto);
  }

  @Post('request')
  createRequest(@Body() createLeadMagnetDto: CreateLeadMagnetRequestDto) {
    return this.leadMagnetService.createRequest(createLeadMagnetDto);
  }

  @Get()
  findAll(@Query() query: LeadMagnetFilterDto) {
    return this.leadMagnetService.findAll(query);
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
