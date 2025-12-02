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
import { SubscribeService } from './subscribe.service';
import { CreateSubscribeDto } from './dto/create-subscribe.dto';
import { UpdateSubscribeDto } from './dto/update-subscribe.dto';
import { ApiTags } from '@nestjs/swagger';
import { ResponseInterceptor } from 'src/utils/response.interceptor';

@ApiTags('subscribe')
@UseInterceptors(ResponseInterceptor)
@Controller('subscribe')
export class SubscribeController {
  constructor(private readonly subscribeService: SubscribeService) {}

  @Post()
  create(@Body() createSubscribeDto: CreateSubscribeDto) {
    return this.subscribeService.create(createSubscribeDto);
  }

  @Get()
  findAll() {
    return this.subscribeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscribeService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubscribeDto: UpdateSubscribeDto,
  ) {
    return this.subscribeService.update(id, updateSubscribeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscribeService.remove(id);
  }
}
