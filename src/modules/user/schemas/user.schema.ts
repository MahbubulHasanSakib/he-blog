import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  versionKey: false,
})
export class User extends Document {
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
    required: false,
    trim: true,
  })
  fullName?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
