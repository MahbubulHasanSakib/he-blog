import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PressMediaDocument = PressMedia & Document;

@Schema({ timestamps: true })
export class PressMedia {
  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  image_alt: string;

  @Prop({ required: true })
  short_summary: string;

  @Prop({ required: true })
  link: string;
}

export const PressMediaSchema = SchemaFactory.createForClass(PressMedia);
