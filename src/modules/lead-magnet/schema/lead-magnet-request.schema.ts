import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LeadDocument = HydratedDocument<LeadMagnetRequest>;

@Schema({ timestamps: true, versionKey: false })
export class LeadMagnetRequest {
  @Prop({ required: true, index: true })
  email: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: false })
  companyName?: string;

  @Prop({ required: false })
  contactNo?: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  fileUrl: string;

  @Prop({ type: Date, default: null })
  emailSentAt: Date;
}

export const LeadMagnetRequestSchema =
  SchemaFactory.createForClass(LeadMagnetRequest);
