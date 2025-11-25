import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schema/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import slugify from 'slugify';
import { PostStatus } from './interface/post-status.type';
import { SearchPost } from './dto/search-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  // Helper to generate a unique slug
  private async generateUniqueSlug(title: string): Promise<string> {
    let baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await this.postModel.exists({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }
    return slug;
  }

  // Create a new post
  async create(createPostDto: CreatePostDto) {
    const slug = createPostDto.slug
      ? await this.generateUniqueSlug(createPostDto.slug)
      : await this.generateUniqueSlug(createPostDto.title);

    const createdPost = await this.postModel.create({
      ...createPostDto,
      slug,
      excerpt:
        createPostDto.excerpt ||
        createPostDto.content.substring(0, 200) + '...',
    });
    return { data: createdPost };
  }

  async findAll(query: SearchPost) {
    const {
      page: queryPage,
      limit: queryLimit,
      status,
      authorId,
      categories,
      tags,
      title,
    } = query;

    const page = +queryPage > 0 ? +queryPage : 1;
    const limit = +queryLimit > 0 ? +queryLimit : 20;
    const skip = limit * (page - 1);

    const match: any = {};
    if (status) match.status = status;
    if (authorId) match.authorId = authorId;
    if (categories && categories.length) match.categories = { $in: categories };
    if (tags && tags.length) match.tags = { $in: tags };
    if (title) match.title = { $regex: title, $options: 'i' };

    const [{ data = [], meta = {} } = {}] = await this.postModel.aggregate([
      { $match: match },
      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: 'categories',
                localField: 'categories',
                foreignField: '_id',
                as: 'categories',
              },
            },
            {
              $lookup: {
                from: 'tags',
                localField: 'tags',
                foreignField: '_id',
                as: 'tags',
              },
            },
            {
              $project: {
                title: 1,
                slug: 1,
                excerpt: 1,
                featuredImageUrl: 1,
                status: 1,
                scheduledAt: 1,
                authorId: 1,
                categories: { name: 1, slug: 1 },
                tags: { name: 1, slug: 1 },
                createdAt: 1,
                updatedAt: 1,
              },
            },
          ],
          meta: [{ $count: 'total' }],
        },
      },
      { $unwind: { path: '$meta', preserveNullAndEmptyArrays: true } },
    ]);

    return {
      data,
      meta: { page, limit, ...meta },
    };
  }

  async findOne(id: string) {
    const post = await this.postModel
      .findById(id)
      .populate('categories', 'name slug')
      .populate('tags', 'name slug')
      .exec();
    if (!post) {
      throw new NotFoundException(`Post with ID "${id}" not found.`);
    }
    return { data: post };
  }

  // Find a published post by slug (for public view)
  async findOneBySlug(slug: string) {
    const post = await this.postModel
      .findOne({ slug, status: PostStatus.PUBLISHED })
      .populate('categories', 'name slug')
      .populate('tags', 'name slug')
      .exec();
    if (!post) {
      throw new NotFoundException(
        `Published post with slug "${slug}" not found.`,
      );
    }
    const updatedPost = await this.postModel
      .findOneAndUpdate({ slug }, { $inc: { views: 1 } }, { new: true })
      .exec();
    return { data: updatedPost };
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const updateData: any = { ...updatePostDto };

    if (updatePostDto.title) {
      updateData.slug = updatePostDto.slug
        ? await this.generateUniqueSlug(updatePostDto.slug)
        : await this.generateUniqueSlug(updatePostDto.title);
    }

    const existingPost = await this.postModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();

    if (!existingPost) {
      throw new NotFoundException(`Post with ID "${id}" not found for update.`);
    }
    return { data: existingPost };
  }

  async remove(id: string) {
    const result = await this.postModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(
        `Post with ID "${id}" not found for deletion.`,
      );
    }
    return { message: 'Post Deleted Successfully' };
  }
}
