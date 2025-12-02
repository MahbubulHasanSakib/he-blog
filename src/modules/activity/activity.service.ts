import { Injectable } from '@nestjs/common';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Activity, ActivityDocument } from './schema/activity.schema';
import { Model } from 'mongoose';

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
  ) {}
  async create(createActivityDto: CreateActivityDto) {
    const activity = await this.activityModel.create(createActivityDto);
    return { data: activity };
  }
}
