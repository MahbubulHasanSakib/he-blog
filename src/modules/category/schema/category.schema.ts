import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true, versionKey: false })
export class Category {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
  })
  slug: string;

  @Prop({ default: null })
  description: string;

  @Prop({ type: Number, default: 0 })
  postCounts: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, default: null, index: true })
  createdBy: mongoose.Schema.Types.ObjectId;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ createdAt: -1 });
