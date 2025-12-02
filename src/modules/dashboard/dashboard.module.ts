import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PostModule } from '../post/post.module';
import { SubscribeModule } from '../subscribe/subscribe.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [SubscribeModule, PostModule, ActivityModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
