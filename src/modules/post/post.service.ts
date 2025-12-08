import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from './schema/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import slugify from 'slugify';
import { PostStatus } from './interface/post-status.type';
import { SearchPost } from './dto/search-post.dto';
import { IUser } from '../user/interfaces/user.interface';
import { Tag, TagDocument } from '../tag/schema/tag.schema';
import { Category, CategoryDocument } from '../category/schema/category.schema';
import { ActivityService } from '../activity/activity.service';
import {
  Subscribe,
  SubscribeDocument,
} from '../subscribe/schema/subscribe.schema';
import { MailService } from '../mail/mail.service';
import { PostView, PostViewDocument } from './schema/post-view.schema';
import { startAndEndOfDate, tz } from 'src/utils/utils';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { User, UserDocument } from '../user/schemas/user.schema';

dayjs.extend(utc);
dayjs.extend(timezone);
@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    @InjectModel(Tag.name) private readonly tagModel: Model<TagDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Subscribe.name)
    private readonly subscribeModel: Model<SubscribeDocument>,
    @InjectModel(PostView.name)
    private readonly postViewModel: Model<PostViewDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private activityService: ActivityService,
    private readonly mailService: MailService,
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

      const statusMessage =
        createPostDto.status === PostStatus.PUBLISHED
          ? 'New Post Published'
          : 'Draft Saved';

      await this.activityService.create({
        message: statusMessage,
        title: createdPost.title,
      });

      if (createPostDto.status === PostStatus.PUBLISHED)
        this.sendBulkEmails({
          postId: createdPost._id,
          title: createdPost.title,
          slug: createdPost.slug,
          categories: createdPost.categories,
          authorId: createdPost.authorId,
          createdAt: createdPost['createdAt'],
          readTime: this.calculateReadTime(createdPost.content),
          excerpt:
            createdPost.excerpt ||
            createdPost.content.substring(0, 200) + '...',
          featuredImageUrl: createdPost.featuredImageUrl,
        });

      return { data: createdPost };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  private calculateReadTime = (content, wordsPerMinute = 100) => {
    if (!content || typeof content !== 'string') {
      return '1 min';
    }

    // Strip HTML tags
    const strippedContent = content.replace(/<[^>]*>/g, '');

    // Count words (split by whitespace and filter empty strings)
    const words = strippedContent
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    const wordCount = words.length;

    // Calculate minutes (round up to at least 1 minute)
    const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));

    return `${minutes} mins`;
  };

  private async sendBulkEmails(info) {
    const batchSize = 500;
    let skip = 0;

    while (true) {
      // 1️⃣ Fetch batch
      const subscribers = await this.subscribeModel
        .find()
        .skip(skip)
        .limit(batchSize)
        .lean();

      if (subscribers.length === 0) break;

      let author = await this.userModel
        .findOne({ _id: info.authorId })
        .select('name image');

      let cats = await this.categoryModel
        .find({ _id: { $in: info.categories } })
        .select('name');

      const joinedCats = cats.map((item) => item.name).join(', ');

      const lastTwoPosts = await this.postModel
        .find({ _id: { $ne: info.postId }, status: PostStatus.PUBLISHED })
        .sort({ createdAt: -1 })
        .limit(2)
        .select('_id slug title featuredImageUrl');

      //console.log(lastTwoPosts);

      const baseSiteUrl = 'https://www.hawkeyesdigital.com/blog/';

      const relatedPostsHtml = lastTwoPosts
        .map(
          (post, index) => `
      <td class="col-2-half" width="50%" 
          style="padding-${index === 0 ? 'right' : 'left'}: 10px; padding-bottom: 20px; vertical-align: top;">

        <a href=${baseSiteUrl + post.slug}
           target="_blank" 
           style="text-decoration: none; display: block;">

          <img src="${post.featuredImageUrl}" 
               alt="${post.title}" 
               width="100%" 
               style="display: block; width: 100%; height: auto; border: 0; border-radius: 4px;">

          <p style="font-size: 15px; color: white; font-weight: bold; margin: 10px 0 5px 0;">
            ${post.title}
          </p>

          <p style="font-size: 12px; margin: 0;">
                            <a href=${baseSiteUrl + post.slug} target="_blank" style="color: #ffc72c; text-decoration: none; font-weight: bold;">
                                READ ARTICLE &rarr;
                            </a>
                        </p>
        </a>
      </td>
    `,
        )
        .join('');

      // 2️⃣ Send emails in batch (500 at once)
      await Promise.all(
        subscribers.map((s) =>
          this.mailService
            .sendEmail(
              { email: s.email },
              `New Blog Post Published: ${info.title}`,
              `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Blog Post Notification - HawkEyes Digital</title>
    
    <style>
        /* Internal CSS for general layout and responsiveness */
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }
        
        /* Media Query for Mobile (max-width: 600px) */
        @media only screen and (max-width: 600px) {
            .container {
                width: 100% !important;
                min-width: 100% !important;
            }
            .content-padding {
                padding-left: 15px !important;
                padding-right: 15px !important;
            }
            .col-2-half {
                width: 100% !important;
                display: block !important;
                padding-left: 0 !important;
                padding-right: 0 !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0;">

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="min-width: 100%;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                
                <table class="container" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #1a1a1a;">
                    
                    <tr>
    <td align="center" style="padding: 30px 25px 20px;">
        
        <a href="[URL_TO_YOUR_WEBSITE]" target="_blank" style="display: inline-block;">
            <img 
                src="https://mlenzdevsa.blob.core.windows.net/mlenz-dev-data/uploads/logo/02-02-2024/logo.png-original" 
                alt="HawkEyes Digital Logo" 
                width="150" 
                height="auto" 
                style="display: block; border: 0; max-width: 150px; margin: 0 auto 5px;"
            >
        </a>
        
        <p style="font-size: 12px; color: #aaaaaa; text-transform: uppercase; margin-top: 0; margin-bottom: 0;">
            NEW BLOG POST JUST PUBLISHED
        </p>
    </td>
</tr>
                    
                    <tr>
                        <td class="content-padding" style="padding: 0 40px; color: #cccccc; font-size: 15px;">
                            <p style="margin-bottom: 15px; margin-top: 0;">
                                Hi There,
                            </p>
                            <p style="margin-bottom: 20px;">
                                We've just published a new article on the HawkEyes blog that you might find useful.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td class="content-padding" align="center" style="padding: 0 40px;">
                            
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #242424; border-radius: 8px;">
                                <tr>
                                    <td align="center" style="padding: 20px;">
                                        
                                        <p align="left" style="font-size: 11px; color: #ffc72c; background-color: #383838; display: inline-block; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 15px; margin-top: 0;">
                                           ${joinedCats}
                                        </p>
                                        
                                        <img src=${info.featuredImageUrl} alt="Blog Post Featured Image" width="100%" style="display: block; width: 100%; max-width: 560px; height: auto; border: 0; border-radius: 4px;">

                                        <div style="padding: 20px 0 0;">
                                            
                                            <h2 style="font-size: 24px; color: white; margin: 0 0 10px 0; font-weight: bold; text-align: left;">
                                                ${info.title}
                                            </h2>
                                            
                                            <p style="font-size: 13px; color: #888888; margin-bottom: 20px; text-align: left;">
                                                👤 ${author.name} &nbsp; | &nbsp;
                                                📅 ${dayjs(info.createdAt).tz(tz).format('DD-MM-YYYY')} &nbsp; | &nbsp;
                                                ⏱️ ${info.readTime}
                                            </p>

                                            <div style="font-size: 16px; color: #cccccc; margin-bottom: 30px; text-align: left;">
                                           ${info.excerpt}
                                           </div>
                                            
                                            <a href=${baseSiteUrl + info.slug} target="_blank" style="display: block; text-decoration: none; background-color: #ffc72c; color: #1a1a1a; padding: 15px 25px; border-radius: 6px; font-weight: bold; font-size: 16px; text-align: center;">
                                                Read Full Article
                                            </a>
                                            
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            </td>
                    </tr>
                    
                    <tr>
                    
                        <td align="center" style="padding: 40px 40px 20px;">
                            <p style="font-size: 12px; color: #aaaaaa; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; margin-top: 0;">
                                YOU MIGHT ALSO LIKE
                            </p>
                            
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    ${relatedPostsHtml}
                                </tr>
                            </table>
                            
                        </td>
                    </tr>
                    
                    <tr>
                        <td align="center" style="padding: 20px 40px 40px; background-color: #121212;">
                            
                             <p style="margin: 20px 0 0 0; text-align: center;">
            <a href="https://www.linkedin.com/company/hedigital-tech/" target="_blank" style="margin: 0 5px;">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRHqvUv15Yv-jy95oOHmX9eCXRlfjW8jZIag&s" alt="LinkedIn" width="24" height="24" style="vertical-align: middle;">
            </a>
            <a href="https://www.facebook.com/hedigital.tech/" target="_blank" style="margin: 0 5px;">
                <img src="https://img.freepik.com/premium-vector/social-media-icon-illustration-facebook-facebook-icon-vector-illustration_561158-2134.jpg?semt=ais_se_enriched&w=740&q=80" alt="Facebook" width="24" height="24" style="vertical-align: middle;">
            </a>
        </p>
                            
                            <p style="font-size: 14px; color: #cccccc; margin: 0 0 15px 0;">
                                HawkEyes Digital Monitoring Ltd<br>
                                2nd Floor, House 09, Road 12, Sector 1<br>
                                Uttara, Dhaka 1230
                            </p>
                            
                            <p style="font-size: 12px; margin: 0 0 20px 0;">
                                <a href="[URL_UNSUBSCRIBE]" target="_blank" style="color: #ffc72c; text-decoration: underline;">
                                    Unsubscribe from blog updates
                                </a>
                            </p>
                            
                            <p style="font-size: 12px; color: #666666; margin: 0;">
                                &copy; 2025 HawkEyes Digital. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
                </td>
        </tr>
    </table>
    </body>
</html>`,
              'not-attached',
            )
            .catch((err) => console.error(`Failed for: ${s.email}`, err)),
        ),
      );

      // 3️⃣ Move to next batch
      skip += batchSize;
    }

    console.log('All emails processed');
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
                pipeline: [{ $project: { name: 1, image: 1 } }],
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
    // 1. Check post exists
    const post = await this.postModel.findById(id);
    if (!post) {
      throw new NotFoundException(`Post with ID "${id}" not found.`);
    }

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, '0')}`;

    const { startOfToday } = startAndEndOfDate();

    // 2. Does the month already exist?
    const existingMonth = post.viewsByMonth?.some(
      (v) => v.month === currentMonth,
    );

    let updatedPost;

    if (existingMonth) {
      // Increment existing month
      updatedPost = await this.postModel
        .findOneAndUpdate(
          {
            _id: id,
            'viewsByMonth.month': currentMonth,
          },
          {
            $inc: {
              views: 1,
              'viewsByMonth.$.views': 1,
            },
            $set: { lastViewedAt: now },
          },
          { new: true },
        )
        .populate('categories', 'name slug')
        .populate('tags', 'name slug')
        .populate('contributors', 'name image')
        .populate('author', 'name image')
        .exec();
    } else {
      // Push new month
      updatedPost = await this.postModel
        .findByIdAndUpdate(
          id,
          {
            $inc: { views: 1 },
            $set: { lastViewedAt: now },
            $push: {
              viewsByMonth: { month: currentMonth, views: 1 },
            },
          },
          { new: true },
        )
        .populate('categories', 'name slug')
        .populate('tags', 'name slug')
        .populate('contributors', 'name image')
        .populate('author', 'name image')
        .exec();
    }

    await this.postViewModel.findOneAndUpdate(
      {
        postId: post._id, // Use the post's ID
        day: startOfToday,
      },
      {
        $inc: { count: 1 },
      },
      {
        upsert: true, // Crucial: create the document if it doesn't exist
      },
    );

    return { data: updatedPost };
  }

  // Find a published post by slug (for public view)
  async findOneBySlug(slug: string) {
    const post = await this.postModel
      .findOne({ slug, status: PostStatus.PUBLISHED })
      .select('_id')
      .exec();
    if (!post) {
      throw new NotFoundException(
        `Published post with slug "${slug}" not found.`,
      );
    }
    return await this.findOne(post._id);
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

      if (updatePostDto.content) {
        updateData.excerpt = updatePostDto.excerpt
          ? updatePostDto.excerpt
          : updatePostDto.content.substring(0, 200) + '...';
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
      if (updateData.status && updateData.status === PostStatus.PUBLISHED) {
        this.sendBulkEmails({
          postId: updatedPost._id,
          title: updatedPost.title,
          slug: updatedPost.slug,
          categories: updatedPost.categories,
          authorId: updatedPost.authorId,
          createdAt: updatedPost['createdAt'],
          readTime: this.calculateReadTime(updatedPost.content),
          excerpt:
            updatedPost.excerpt ||
            updatedPost.content.substring(0, 200) + '...',
          featuredImageUrl: updatedPost.featuredImageUrl,
        });
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
