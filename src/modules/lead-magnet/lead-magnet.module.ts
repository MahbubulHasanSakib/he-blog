import { Module } from '@nestjs/common';
import { LeadMagnetService } from './lead-magnet.service';
import { LeadMagnetController } from './lead-magnet.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadMagnet, LeadMagnetSchema } from './schema/lead-magnet.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LeadMagnet.name, schema: LeadMagnetSchema },
    ]),
  ],
  controllers: [LeadMagnetController],
  providers: [LeadMagnetService],
})
export class LeadMagnetModule {}
