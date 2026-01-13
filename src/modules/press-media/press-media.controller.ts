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
import { PressMediaService } from './press-media.service';
import { CreatePressMediaDto } from './dto/create-press-media.dto';
import { UpdatePressMediaDto } from './dto/update-press-media.dto';
import { ApiTags } from '@nestjs/swagger';
import { ResponseInterceptor } from 'src/utils/response.interceptor';

@ApiTags('press-media')
@UseInterceptors(ResponseInterceptor)
@Controller('press-media')
export class PressMediaController {
  constructor(private readonly pressMediaService: PressMediaService) {}

  @Post()
  create(@Body() createPressMediaDto: CreatePressMediaDto) {
    return this.pressMediaService.create(createPressMediaDto);
  }

  @Get()
  findAll() {
    return this.pressMediaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pressMediaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePressMediaDto: UpdatePressMediaDto,
  ) {
    return this.pressMediaService.update(id, updatePressMediaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pressMediaService.remove(id);
  }
}
