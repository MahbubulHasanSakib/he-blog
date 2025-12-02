import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ActivityDocument = Activity & Document;

@Schema({ timestamps: true, versionKey: false })
export class Activity {
  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  title: string;

  @Prop({ default: new Date() })
  createdAt: Date;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);

ActivitySchema.index({ createdAt: -1 });
