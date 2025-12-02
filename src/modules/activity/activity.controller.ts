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
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ApiTags } from '@nestjs/swagger';
import { ResponseInterceptor } from 'src/utils/response.interceptor';

@ApiTags('activity')
@UseInterceptors(ResponseInterceptor)
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  create(@Body() createActivityDto: CreateActivityDto) {
    return this.activityService.create(createActivityDto);
  }
}
