import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TagDocument = Tag & Document;

@Schema({ timestamps: true, versionKey: false })
export class Tag {
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
}

export const TagSchema = SchemaFactory.createForClass(Tag);
