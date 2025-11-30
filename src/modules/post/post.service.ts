import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { Post, PostDocument } from './schema/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import slugify from 'slugify';
import { PostStatus } from './interface/post-status.type';
import { SearchPost } from './dto/search-post.dto';
import { IUser } from '../user/interfaces/user.interface';
import { Tag, TagDocument } from '../tag/schema/tag.schema';
import { Category, CategoryDocument } from '../category/schema/category.schema';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    @InjectModel(Tag.name) private readonly tagModel: Model<TagDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectConnection() private readonly connection: Connection, // <-- Add t
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
  async create(createPostDto: CreatePostDto, user: any) {
    try {
      // 1️⃣ Generate unique post slug
      const slug = await this.generateUniqueSlug(
        createPostDto.slug || createPostDto.title,
      );

      // 2️⃣ Process tags (upsert)
      const tagIds = [];
      const tagNames: string[] = createPostDto.tags || [];

      for (const name of tagNames) {
        const tagSlug = slugify(name, { lower: true });
        const tag = await this.tagModel.findOneAndUpdate(
          { slug: tagSlug },
          { $setOnInsert: { name, slug: tagSlug } },
          { new: true, upsert: true },
        );
        tagIds.push(tag._id);
      }

      const createdPost = await this.postModel.create({
        ...createPostDto,
        authorId: user._id,
        slug,
        tags: tagIds,
        excerpt:
          createPostDto.excerpt ||
          createPostDto.content.substring(0, 200) + '...',
      });

      // 4️⃣ Increment category post count
      if (createPostDto.categories && createPostDto.categories.length > 0) {
        const categoryIds = createPostDto.categories.map(
          (id) => new Types.ObjectId(id),
        );

        await this.categoryModel.updateMany(
          { _id: { $in: categoryIds } },
          { $inc: { postCounts: 1 } },
        );
      }

      return { data: createdPost };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
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
    if (categories && categories.length)
      match.categories = { $in: categories?.map((e) => new Types.ObjectId(e)) };
    if (tags && tags.length)
      match.tags = { $in: tags?.map((e) => new Types.ObjectId(e)) };
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
              $lookup: {
                from: 'users',
                localField: 'authorId',
                foreignField: '_id',
                pipeline: [{ $project: { name: 1 } }],
                as: 'author',
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
                author: { $ifNull: [{ $first: '$author' }, null] },
                categories: { name: 1, slug: 1 },
                tags: { name: 1, slug: 1 },
                views: 1,
                createdAt: 1,
                updatedAt: 1,
                lastEdited: { $ifNull: [{ $last: '$editHistory' }, null] },
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
      .findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
      .populate('categories', 'name slug')
      .populate('tags', 'name slug')
      .populate('contributors', 'name')
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

  async update(id: string, updatePostDto: UpdatePostDto, user: IUser) {
    const session = await this.postModel.db.startSession();
    session.startTransaction();

    try {
      const updateData: any = { ...updatePostDto };

      if (updatePostDto.title) {
        updateData.slug = updatePostDto.slug
          ? await this.generateUniqueSlug(updatePostDto.slug)
          : await this.generateUniqueSlug(updatePostDto.title);
      }

      if (updatePostDto.tags?.length) {
        const tagIds = [];

        for (const name of updatePostDto.tags) {
          const tagSlug = slugify(name, { lower: true });

          const tag = await this.tagModel.findOneAndUpdate(
            { slug: tagSlug },
            { $setOnInsert: { name, slug: tagSlug } },
            { new: true, upsert: true, session },
          );

          tagIds.push(tag._id);
        }

        updateData.tags = tagIds;
      }

      if (updatePostDto.categories) {
        const newCategoryIds = updatePostDto.categories.map(
          (id) => new Types.ObjectId(id),
        );

        const existingPost = await this.postModel
          .findById(id)
          .select('categories')
          .session(session);

        if (!existingPost) {
          throw new NotFoundException('Post not found');
        }

        const oldIds = existingPost.categories.map((x) => x.toString());
        const newIds = newCategoryIds.map((x) => x.toString());

        const added = newIds.filter((x) => !oldIds.includes(x));
        const removed = oldIds.filter((x) => !newIds.includes(x));

        if (added.length > 0) {
          await this.categoryModel.updateMany(
            { _id: { $in: added } },
            { $inc: { postCounts: 1 } },
            { session },
          );
        }

        if (removed.length > 0) {
          await this.categoryModel.updateMany(
            { _id: { $in: removed } },
            { $inc: { postCounts: -1 } },
            { session },
          );
        }

        updateData.categories = newCategoryIds;
      }

      const updateQuery = {
        $set: updateData,
        $push: {
          editHistory: {
            modifier: user._id,
            modifierName: user.name,
            modifiedAt: new Date(),
            _id: undefined,
          },
        },
      };

      const updatedPost = await this.postModel.findByIdAndUpdate(
        id,
        updateQuery,
        { new: true, session },
      );

      if (!updatedPost) {
        throw new NotFoundException('Post not found for update.');
      }

      await session.commitTransaction();
      session.endSession();

      return { data: updatedPost };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw new BadRequestException(error.message);
    }
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
