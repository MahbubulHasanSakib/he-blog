import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ResponseInterceptor } from 'src/utils/response.interceptor';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('dashboard')
@UseInterceptors(ResponseInterceptor)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getAllAnalytics() {
    return this.dashboardService.getAllAnalytics();
  }
}
