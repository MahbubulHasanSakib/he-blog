import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubscribeDocument = Subscribe & Document;

@Schema({ timestamps: true, versionKey: false })
export class Subscribe {
  @Prop({ required: true, unique: true })
  email: string;
}

export const SubscribeSchema = SchemaFactory.createForClass(Subscribe);
