import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LeadMagnetDocument = LeadMagnet & Document;

@Schema({ _id: false })
export class Image {
  @Prop({ required: true })
  original: string;

  @Prop({ required: true })
  thumb: string;
}
export const ImageSchema = SchemaFactory.createForClass(Image);
@Schema({ timestamps: true, versionKey: false })
export class LeadMagnet {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true, default: '' })
  description: string;

  @Prop({ required: true, trim: true })
  fileUrl: string;

  @Prop({ required: false, trim: true })
  fileName: string;

  @Prop({ required: false, trim: true })
  fileType: string;

  @Prop({ type: ImageSchema, required: false })
  image: Image;

  @Prop({ required: true, trim: true })
  type: string;

  @Prop({ required: true, trim: true })
  buttonOneText: string;

  @Prop({ required: false, trim: true })
  buttonTwoText: string;

  @Prop({ required: false, trim: true })
  buttonTwoLink: string;
}

export const LeadMagnetSchema = SchemaFactory.createForClass(LeadMagnet);
