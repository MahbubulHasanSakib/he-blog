import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schema/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import slugify from 'slugify';
import { IUser } from '../user/interfaces/user.interface';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  // Helper to ensure slugs are unique
  private async generateUniqueSlug(name: string) {
    let baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await this.categoryModel.exists({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }
    return slug;
  }

  async create(createCategoryDto: CreateCategoryDto, user: IUser) {
    const slug = createCategoryDto.slug
      ? await this.generateUniqueSlug(createCategoryDto.slug)
      : await this.generateUniqueSlug(createCategoryDto.name);

    const createdCategory = await this.categoryModel.create({
      ...createCategoryDto,
      slug,
      createdBy: user._id,
    });
    return { data: createdCategory };
  }

  async findAll() {
    let categories = await this.categoryModel
      .find()
      .sort({ createdAt: -1 })
      .select('name slug postCounts')
      .exec();
    return { data: categories };
  }

  async findOne(id: string) {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }
    return { data: category };
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const updateData: any = { ...updateCategoryDto };

    if (updateCategoryDto.name) {
      updateData.slug = updateCategoryDto.slug
        ? await this.generateUniqueSlug(updateCategoryDto.slug)
        : await this.generateUniqueSlug(updateCategoryDto.name);
    }

    const existingCategory = await this.categoryModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();

    if (!existingCategory) {
      throw new NotFoundException(
        `Category with ID "${id}" not found for update.`,
      );
    }
    return { data: existingCategory };
  }

  async remove(id: string) {
    const result = await this.categoryModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(
        `Category with ID "${id}" not found for deletion.`,
      );
    }
    return { data: { message: 'Category deleted successfully' } };
  }
}
