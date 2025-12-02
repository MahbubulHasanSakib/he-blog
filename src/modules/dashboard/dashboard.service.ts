import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../post/schema/post.schema';
import { Model } from 'mongoose';
import {
  Subscribe,
  SubscribeDocument,
} from '../subscribe/schema/subscribe.schema';
import { startAndEndOfDate } from 'src/utils/utils';
import { Activity, ActivityDocument } from '../activity/schema/activity.schema';
import { PostStatus } from '../post/interface/post-status.type';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    @InjectModel(Subscribe.name)
    private readonly subscribeModel: Model<SubscribeDocument>,
    @InjectModel(Activity.name)
    private readonly activityModel: Model<ActivityDocument>,
  ) {}
  async getAllAnalytics() {
    const now = new Date();
    const {
      startOfMonth,
      startOfPreviousMonth: startOfLastMonth,
      endOfPreviousMonth: endOfLastMonth,
    } = startAndEndOfDate();
    console.log({ startOfMonth, startOfLastMonth, endOfLastMonth });
    console.log({
      current: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      last: `${startOfLastMonth.getFullYear()}-${String(startOfLastMonth.getMonth() + 1).padStart(2, '0')}`,
    });
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
    console.log({ currentMonthViews, lastMonthViews });
    const viewsPercentageChange =
      lastMonthViews > 0
        ? ((currentMonthViews - lastMonthViews) / lastMonthViews) * 100
        : 0;

    // Process Authors
    const totalAuthorsCount = uniqueAuthors.length;
    const newAuthors = newAuthorsThisMonth[0]?.newAuthors || 0;

    // Process Subscribers
    const subscribersGrowth =
      lastMonthSubscribers > 0
        ? ((totalSubscribers - lastMonthSubscribers) / lastMonthSubscribers) *
          100
        : 0;

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
}
