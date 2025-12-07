import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Res,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { FilterReportDto } from './dto/filter-report.dto';
import type { Response } from 'express';

@ApiTags('report')
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('lead-magnet-requests')
  async downloadLeadMagnetRequests(
    @Body() filterReportDto: FilterReportDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.reportService.downloadLeadMagnetReport(filterReportDto, res);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('subscribers')
  async subscribers(
    @Body() filterReportDto: FilterReportDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.reportService.subscribers(filterReportDto, res);
  }
}
