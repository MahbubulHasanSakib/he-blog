// src/modules/post/schema/post-view.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

export type PostViewDocument = PostView & Document;

@Schema({ timestamps: true, versionKey: false })
export class PostView {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true,
  })
  postId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, index: true })
  day: Date;

  @Prop({ required: true, default: 0 })
  count: number;
}

export const PostViewSchema = SchemaFactory.createForClass(PostView);

PostViewSchema.index({ postId: 1, day: 1 }, { unique: true });
PostViewSchema.index({ day: 1 });
