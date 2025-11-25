import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tag, TagDocument } from './schema/tag.schema';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import slugify from 'slugify';

@Injectable()
export class TagService {
  constructor(
    @InjectModel(Tag.name) private readonly tagModel: Model<TagDocument>,
  ) {}

  // Helper to ensure slugs are unique
  private async generateUniqueSlug(name: string): Promise<string> {
    let baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await this.tagModel.exists({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }
    return slug;
  }

  async create(createTagDto: CreateTagDto) {
    const slug = createTagDto.slug
      ? await this.generateUniqueSlug(createTagDto.slug)
      : await this.generateUniqueSlug(createTagDto.name);

    const createdTag = await this.tagModel.create({ ...createTagDto, slug });
    return { data: createdTag };
  }

  async findAll() {
    let tags = await this.tagModel.find().sort({ name: 1 }).exec();
    return { data: tags };
  }

  async findOne(id: string) {
    const tag = await this.tagModel.findById(id).exec();
    if (!tag) {
      throw new NotFoundException(`Tag with ID "${id}" not found.`);
    }
    return { data: tag };
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    const updateData: any = { ...updateTagDto };

    if (updateTagDto.name) {
      updateData.slug = updateTagDto.slug
        ? await this.generateUniqueSlug(updateTagDto.slug)
        : await this.generateUniqueSlug(updateTagDto.name);
    }

    const existingTag = await this.tagModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();

    if (!existingTag) {
      throw new NotFoundException(`Tag with ID "${id}" not found for update.`);
    }
    return { data: existingTag };
  }

  async remove(id: string) {
    const result = await this.tagModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(
        `Tag with ID "${id}" not found for deletion.`,
      );
    }
    return { daat: { message: 'Tag deleted Successfully' } };
  }
}
