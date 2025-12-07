import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ResponseInterceptor } from 'src/utils/response.interceptor';
import { ApiTags } from '@nestjs/swagger';
import { startAndEndOfDate } from 'src/utils/utils';
@ApiTags('dashboard')
@UseInterceptors(ResponseInterceptor)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getAllAnalytics() {
    return this.dashboardService.getAllAnalytics();
  }

  @Get('traffic-analytics')
  async getPostDailyViews(@Query('days') days?: string) {
    let from: Date | undefined;
    let to: Date | undefined;

    switch (days) {
      case '24 hours': {
        const { startOfToday, endOfToday } = startAndEndOfDate();
        from = startOfToday;
        to = endOfToday;
        break;
      }
      case '7 days': {
        const { startOfToday: start7DaysAgo } = startAndEndOfDate(
          new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 previous days + today
        );
        const { endOfToday } = startAndEndOfDate();
        from = start7DaysAgo;
        to = endOfToday;
        break;
      }
      case '30 days': {
        const { startOfToday: start30DaysAgo } = startAndEndOfDate(
          new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
        );
        const { endOfToday } = startAndEndOfDate();
        from = start30DaysAgo;
        to = endOfToday;
        break;
      }
      case '12 months': {
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        const { startOfToday: start12MonthsAgo } = startAndEndOfDate(startDate);

        const { endOfToday } = startAndEndOfDate();

        from = start12MonthsAgo;
        to = endOfToday;
        break;
      }
      default: {
        const { startOfToday, endOfToday } = startAndEndOfDate();
        from = startOfToday;
        to = endOfToday;
      }
    }
    //console.log({ from, to });
    return this.dashboardService.getDailyViews(from, to, days);
  }
}
