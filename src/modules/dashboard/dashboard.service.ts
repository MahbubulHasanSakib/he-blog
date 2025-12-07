import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../post/schema/post.schema';
import { Model, PipelineStage } from 'mongoose';
import {
  Subscribe,
  SubscribeDocument,
} from '../subscribe/schema/subscribe.schema';
import { startAndEndOfDate } from 'src/utils/utils';
import { Activity, ActivityDocument } from '../activity/schema/activity.schema';
import { PostStatus } from '../post/interface/post-status.type';
import { PostView, PostViewDocument } from '../post/schema/post-view.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    @InjectModel(Subscribe.name)
    private readonly subscribeModel: Model<SubscribeDocument>,
    @InjectModel(Activity.name)
    private readonly activityModel: Model<ActivityDocument>,
    @InjectModel(PostView.name)
    private readonly postViewModel: Model<PostViewDocument>,
  ) {}
  async getAllAnalytics() {
    const now = new Date();
    const {
      startOfMonth,
      startOfPreviousMonth: startOfLastMonth,
      endOfPreviousMonth: endOfLastMonth,
    } = startAndEndOfDate();

    // Execute all queries in parallel for better performance
    const [
      totalViewsResult,
      currentMonthViewsResult,
      lastMonthViewsResult,
      totalPosts,
      postsThisMonth,
      uniqueAuthors,
      newAuthorsThisMonth,
      totalSubscribers,
      lastMonthSubscribers,
    ] = await Promise.all([
      // Total Views
      this.postModel.aggregate([
        {
          $group: {
            _id: null,
            totalViews: { $sum: '$views' },
          },
        },
      ]),

      // Current Month Views (from viewsByMonth array)
      this.postModel.aggregate([
        {
          $unwind: {
            path: '$viewsByMonth',
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $match: {
            'viewsByMonth.month': `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
          },
        },
        {
          $group: {
            _id: null,
            currentMonthViews: { $sum: '$viewsByMonth.views' },
          },
        },
      ]),

      // Last Month Views (from viewsByMonth array)
      this.postModel.aggregate([
        {
          $unwind: {
            path: '$viewsByMonth',
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $match: {
            'viewsByMonth.month': `${startOfLastMonth.getFullYear()}-${String(startOfLastMonth.getMonth() + 1).padStart(2, '0')}`,
          },
        },
        {
          $group: {
            _id: null,
            lastMonthViews: { $sum: '$viewsByMonth.views' },
          },
        },
      ]),

      // Total Published Posts
      this.postModel.countDocuments({ status: PostStatus.PUBLISHED }),

      // Posts This Month
      this.postModel.countDocuments({
        createdAt: { $gte: startOfMonth },
        status: PostStatus.PUBLISHED,
      }),

      // Unique Authors
      this.postModel.distinct('authorId'),

      // New Authors This Month
      this.postModel.aggregate([
        {
          $group: {
            _id: '$authorId',
            firstPost: { $min: '$createdAt' },
          },
        },
        {
          $match: {
            firstPost: { $gte: startOfMonth },
          },
        },
        {
          $count: 'newAuthors',
        },
      ]),

      // Total Subscribers
      this.subscribeModel.countDocuments(),

      // Last Month Subscribers
      this.subscribeModel.countDocuments({
        createdAt: { $lte: endOfLastMonth },
      }),
    ]);

    // Process Total Views
    const totalViews = totalViewsResult[0]?.totalViews || 0;
    const currentMonthViews =
      currentMonthViewsResult[0]?.currentMonthViews || 0;
    const lastMonthViews = lastMonthViewsResult[0]?.lastMonthViews || 1; // Avoid division by zero

    // Calculate percentage change: (current month - last month) / last month * 100

    let viewsPercentageChange: number;

    if (lastMonthViews === 0) {
      viewsPercentageChange = currentMonthViews === 0 ? 0 : 100;
    } else {
      viewsPercentageChange =
        ((currentMonthViews - lastMonthViews) / lastMonthViews) * 100;
    }

    // Process Authors
    const totalAuthorsCount = uniqueAuthors.length;
    const newAuthors = newAuthorsThisMonth[0]?.newAuthors || 0;

    // Subscribers growth
    let subscribersGrowth: number;

    if (lastMonthSubscribers === 0) {
      subscribersGrowth = totalSubscribers === 0 ? 0 : 100;
    } else {
      subscribersGrowth =
        ((totalSubscribers - lastMonthSubscribers) / lastMonthSubscribers) *
        100;
    }

    const roundedViewsChange = Math.round(viewsPercentageChange * 10) / 10;
    const roundedSubscribersGrowth = Math.round(subscribersGrowth * 10) / 10;

    let topPosts = await this.postModel.aggregate([
      {
        $sort: { views: -1 },
      },
      {
        $limit: 3,
      },
      {
        $project: {
          _id: 0,
          title: 1,
          views: 1,
        },
      },
    ]);

    let recentActivities = await this.activityModel.aggregate([
      {
        $sort: { createdAt: -1 },
      },
      {
        $limit: 3,
      },
      {
        $project: {
          _id: 0,
          message: 1,
          title: 1,
          createdAt: 1,
        },
      },
    ]);

    return {
      data: {
        stats: [
          {
            title: 'Total Views',
            value: totalViews,
            //percentageChange: Math.round(viewsPercentageChange * 10) / 10,
            change: `${roundedViewsChange >= 0 ? '+' : ''}${roundedViewsChange}% from last month`,
          },
          {
            title: 'New Posts',
            value: totalPosts,
            //thisMonth: postsThisMonth,
            change: `+${postsThisMonth} this month`,
          },
          {
            title: 'Total Authors',
            value: totalAuthorsCount,
            //newThisMonth: newAuthors,
            change: `+${newAuthors} new this month`,
          },
          {
            title: 'Subscribers',
            value: totalSubscribers,
            //percentageGrowth: Math.round(subscribersGrowth * 10) / 10,
            change: `${roundedSubscribersGrowth >= 0 ? '+' : ''}${roundedSubscribersGrowth}% growth`,
          },
        ],
        topPosts,
        recentActivities,
      },
    };
  }

  async getDailyViews(from: Date, to: Date, days?: string) {
    // Current period aggregation
    const currentQuery = { day: { $gte: from, $lte: to } };
    const currentPipeline: PipelineStage[] = [
      { $match: currentQuery },
      {
        $group: {
          _id: '$day',
          views: { $sum: '$count' },
        },
      },
      { $sort: { _id: 1 } },
    ];
    const currentResult = await this.postViewModel
      .aggregate(currentPipeline)
      .exec();

    // Step: create day-wise array for current period
    const dates: Date[] = [];
    const currentDate = new Date(from);
    while (currentDate <= to) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const dayWiseData = dates.map((dateObj) => {
      const found = currentResult.find(
        (r) => r._id.getTime() === dateObj.getTime(),
      );

      return {
        day: dateObj,
        views: found ? found.views : 0,
      };
    });

    // Previous period aggregation
    const diffMs = to.getTime() - from.getTime();
    const prevFrom = new Date(from.getTime() - diffMs - 1);
    const prevTo = new Date(from.getTime() - 1);

    const prevQuery: any = { day: { $gte: prevFrom, $lte: prevTo } };
    const prevPipeline: PipelineStage[] = [
      { $match: prevQuery },
      {
        $group: { _id: null, totalViews: { $sum: '$count' } },
      },
    ];
    const [prevResult] = await this.postViewModel
      .aggregate(prevPipeline)
      .exec();
    const totalPrevViews = prevResult?.totalViews || 0;

    // 3️⃣ Overview & % change
    const totalCurrentViews = dayWiseData.reduce((sum, d) => sum + d.views, 0);
    let label = '';
    switch (days) {
      case '24 hours':
        label = 'vs last 24 hours';
        break;
      case '7 days':
        label = 'vs last 7 days';
        break;
      case '30 days':
        label = 'vs last 30 days';
        break;
      case '12 months':
        label = 'vs last 12 months';
        break;
      default:
        label = 'vs previous period';
    }

    let percentageChange: string;

    if (totalPrevViews === 0) {
      percentageChange =
        totalCurrentViews === 0 ? `0% ${label}` : `↑100% ${label}`;
    } else {
      let change =
        ((totalCurrentViews - totalPrevViews) / totalPrevViews) * 100;
      change = Math.round(change * 10) / 10; // 1 decimal
      percentageChange =
        (change >= 0 ? '↑' : '↓') + Math.abs(change) + `% ${label}`;
    }

    return {
      data: {
        overview: totalCurrentViews,
        change: percentageChange, // ↑ positive, ↓ negative
        dayWiseData,
      },
    };
  }
}
