import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ _id: false })
export class Image {
  @Prop({ required: true })
  original: string;

  @Prop({ required: true })
  thumb: string;
}
export const ImageSchema = SchemaFactory.createForClass(Image);

@Schema({
  timestamps: true,
  versionKey: false,
})
export class User {
  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({
    type: String,
    required: true,
    minlength: 8,
  })
  password: string;

  @Prop({
    type: String,
    maxlength: 100,
    trim: true,
    required: false,
  })
  name?: string;

  @Prop({ type: ImageSchema })
  image: Image;
}

export const UserSchema = SchemaFactory.createForClass(User);
