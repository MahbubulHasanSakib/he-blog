import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  Patch,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostStatus } from './interface/post-status.type';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaginateDto } from 'src/utils/dto/paginate.dto';
import { SearchPost } from './dto/search-post.dto';
import { ResponseInterceptor } from 'src/utils/response.interceptor';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../user/user.decorator';
import { IUser } from '../user/interfaces/user.interface';

@ApiTags('posts')
@UseInterceptors(ResponseInterceptor)
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createPostDto: CreatePostDto, @User() user: IUser) {
    return this.postService.create(createPostDto, user);
  }

  @Get()
  findAll(@Query() query: SearchPost) {
    return this.postService.findAll(query);
  }

  @Get('slug/:slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.postService.findOneBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto,@User() user:IUser) {
    return this.postService.update(id, updatePostDto,user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.postService.remove(id);
  }
}
