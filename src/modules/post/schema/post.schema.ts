import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from 'src/modules/category/schema/category.schema';
import { Tag } from 'src/modules/tag/schema/tag.schema';
import { PostStatus } from '../interface/post-status.type';
import * as mongoose from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true, versionKey: false })
export class Post {
  @Prop({ required: true, unique: true, trim: true })
  title: string;

  @Prop({
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
  })
  slug: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: null })
  excerpt: string;

  @Prop({
    type: String,
    enum: PostStatus,
    default: PostStatus.DRAFT,
    index: true,
  })
  status: PostStatus;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, index: true })
  authorId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null })
  featuredImageUrl: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    default: [],
  })
  categories: mongoose.Schema.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    default: [],
  })
  tags: mongoose.Schema.Types.ObjectId[];

  @Prop({ default: null, index: true })
  scheduledAt: Date;

  @Prop({ type: Number, default: 0 })
  views: number;
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.index({ slug: 1, status: 1 });
PostSchema.index({ categories: 1, status: 1 });
