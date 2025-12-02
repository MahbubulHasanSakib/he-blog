import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Activity, ActivitySchema } from './schema/activity.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Activity.name, schema: ActivitySchema },
    ]),
  ],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService, MongooseModule],
})
export class ActivityModule {}
