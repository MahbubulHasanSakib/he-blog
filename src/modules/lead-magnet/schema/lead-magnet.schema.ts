import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LeadMagnetDocument = LeadMagnet & Document;

@Schema({ timestamps: true, versionKey: false })
export class LeadMagnet {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true, default: '' })
  description: string;

  @Prop({ required: true, trim: true })
  fileUrl: string;

  @Prop({ required: true, trim: true })
  fileName: string;

  @Prop({ required: true, trim: true })
  fileType: string;
}

export const LeadMagnetSchema = SchemaFactory.createForClass(LeadMagnet);
