import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from 'src/modules/category/schema/category.schema';
import { Tag } from 'src/modules/tag/schema/tag.schema';
import { PostStatus } from '../interface/post-status.type';
import * as mongoose from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true, versionKey: false })
export class Post {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
  })
  slug: string;

  @Prop({ required: false })
  content: string;

  @Prop({ required: false })
  excerpt: string;

  @Prop({
    type: String,
    enum: PostStatus,
    default: PostStatus.DRAFT,
    index: true,
    required: true,
  })
  status: PostStatus;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  authorId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: false })
  featuredImageUrl: string;

  @Prop({ required: false })
  featuredImageAlt: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    default: [],
    required: false,
  })
  categories: mongoose.Schema.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    default: [],
    required: false,
  })
  tags: mongoose.Schema.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
    required: false,
  })
  contributors: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: Number, default: 0 })
  views: number;

  @Prop({ type: Date, default: null })
  lastViewedAt: Date;

  @Prop({
    type: [
      {
        month: String,
        views: Number,
        _id: false,
      },
    ],
    default: [],
  })
  viewsByMonth: { month: string; views: number }[];

  @Prop({
    type: [
      {
        _id: false,
        modifier: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        modifierName: { type: String },
        modifiedAt: { type: Date, default: new Date() },
      },
    ],
    default: [],
  })
  editHistory: {
    modifier: mongoose.Schema.Types.ObjectId;
    modifiedAt: Date;
  }[];

  @Prop({
    type: [
      {
        question: String,
        answer: String,
      },
    ],
    default: [],
    required: false,
  })
  faqs: { question: string; answer: string }[];

  @Prop({ type: String, required: false })
  staticLeadMagnet: string;

  @Prop({ type: String, required: false })
  description: string;

  @Prop({ type: String, required: false })
  seoTitle: string;

  @Prop({ type: String, required: false })
  metaDescription: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.index({ slug: 1, status: 1 });
PostSchema.index({ categories: 1, status: 1 });
PostSchema.index({ createdAt: -1 });

PostSchema.virtual('author', {
  ref: 'User',
  localField: 'authorId',
  foreignField: '_id',
  justOne: true,
});

PostSchema.set('toObject', { virtuals: true } as any);
PostSchema.set('toJSON', { virtuals: true } as any);
