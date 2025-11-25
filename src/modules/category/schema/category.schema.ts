import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
}

export const CategorySchema = SchemaFactory.createForClass(Category);
