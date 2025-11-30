import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResponseInterceptor } from 'src/utils/response.interceptor';
import { AuthGuard } from '../auth/auth.guard';
import { IUser } from '../user/interfaces/user.interface';
import { User } from '../user/user.decorator';

@ApiTags('categories')
@UseInterceptors(ResponseInterceptor)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // POST /categories: Create a new category
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto, @User() user: IUser) {
    return this.categoryService.create(createCategoryDto, user);
  }

  // GET /categories: Get all categories
  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  // GET /categories/:id: Get a single category by ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  // PUT /categories/:id: Update an existing category
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  // DELETE /categories/:id: Delete a category
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
