import { Module } from '@nestjs/common';
import { LeadMagnetService } from './lead-magnet.service';
import { LeadMagnetController } from './lead-magnet.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadMagnet, LeadMagnetSchema } from './schema/lead-magnet.schema';
import {
  LeadMagnetRequest,
  LeadMagnetRequestSchema,
} from './schema/lead-magnet-request.schema';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MailModule,
    MongooseModule.forFeature([
      { name: LeadMagnet.name, schema: LeadMagnetSchema },
      { name: LeadMagnetRequest.name, schema: LeadMagnetRequestSchema },
    ]),
  ],
  controllers: [LeadMagnetController],
  providers: [LeadMagnetService],
  exports: [MongooseModule],
})
export class LeadMagnetModule {}
