import { Injectable } from '@nestjs/common';
import { FilterReportDto } from './dto/filter-report.dto';
import { startAndEndOfDate, wsMergedCells } from 'src/utils/utils';
import { Model, Types } from 'mongoose';
import type { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import * as Excel from '@zlooun/exceljs';
import {
  LeadDocument,
  LeadMagnetRequest,
} from '../lead-magnet/schema/lead-magnet-request.schema';
import {
  Subscribe,
  SubscribeDocument,
} from '../subscribe/schema/subscribe.schema';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(LeadMagnetRequest.name)
    private readonly leadRequestModel: Model<LeadDocument>,
    @InjectModel(Subscribe.name)
    private readonly subscribeModel: Model<SubscribeDocument>,
  ) {}
  async downloadLeadMagnetReport(query: FilterReportDto, res: Response) {
    const { startOfToday, endOfToday } = startAndEndOfDate();
    const { from, to, index, leadMagnetId } = query;

    let dayQuery: any = {
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    };
    let filterQuery: any = {};
    if (from) {
      const { startOfToday: startDate } = startAndEndOfDate(from);
      dayQuery = {
        createdAt: {
          ...dayQuery.createdAt,
          $gte: startDate,
        },
      };
    }

    if (to) {
      const { endOfToday: endDate } = startAndEndOfDate(to);
      dayQuery = {
        createdAt: {
          ...dayQuery.createdAt,
          $lte: endDate,
        },
      };
    }
    if (leadMagnetId)
      filterQuery['leadMagnetId'] = new Types.ObjectId(leadMagnetId);

    const count = 50000;

    const cursor = await this.leadRequestModel
      .aggregate([
        {
          $match: {
            ...dayQuery,
            ...filterQuery,
            deletedAt: null,
          },
        },
        { $skip: count * index },
        { $limit: count },
      ])
      .cursor();

    const doc = await cursor.next();

    if (!doc) {
      return { data: null };
    }

    res.set({
      'Access-Control-Expose-Headers': 'Content-Disposition',
      'Content-Disposition': `attachment; filename="Lead Magnet Download Report - ${index + 1}.xlsx"`,
      'Content-Type': 'application/vnd.ms-excel',
    });

    const wb = new Excel.stream.xlsx.WorkbookWriter({
      stream: res,
      useStyles: true,
    });

    const ws = wb.addWorksheet('Sheet1');

    const rawHeader = [
      'Email',
      'Full Name',
      'Company Name',
      'Contact No',
      'File Name',
      'File Url',
    ];

    const rows: string[][] = [[...rawHeader]];

    rows.forEach((row) => ws.addRow(row));

    ws.eachRow((row) => {
      row.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'ff000000' } },
          left: { style: 'thin', color: { argb: 'ff000000' } },
          bottom: { style: 'thin', color: { argb: 'ff000000' } },
          right: { style: 'thin', color: { argb: 'ff000000' } },
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'ffffc000' },
        };
      });
    });

    wsMergedCells(rows).forEach((m) => ws.mergeCells(m));

    async function createAndFillWorkbook(data) {
      const { email, fullName, companyName, contactNo, fileName, fileUrl } =
        data;

      await ws
        .addRow([email, fullName, companyName, contactNo, fileName, fileUrl])
        .commit();
    }

    await createAndFillWorkbook(doc);

    await cursor.eachAsync(createAndFillWorkbook);

    await ws.commit();

    await wb.commit();
  }

  async subscribers(query: FilterReportDto, res: Response) {
    const { startOfToday, endOfToday } = startAndEndOfDate();
    const { from, to, index } = query;

    let dayQuery: any = {
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    };
    let filterQuery: any = {};
    if (from) {
      const { startOfToday: startDate } = startAndEndOfDate(from);
      dayQuery = {
        createdAt: {
          ...dayQuery.createdAt,
          $gte: startDate,
        },
      };
    }

    if (to) {
      const { endOfToday: endDate } = startAndEndOfDate(to);
      dayQuery = {
        createdAt: {
          ...dayQuery.createdAt,
          $lte: endDate,
        },
      };
    }

    const count = 50000;

    const cursor = await this.subscribeModel
      .aggregate([
        {
          $match: {
            ...dayQuery,
            deletedAt: null,
          },
        },
        { $skip: count * index },
        { $limit: count },
      ])
      .cursor();

    const doc = await cursor.next();

    if (!doc) {
      return { data: null };
    }

    res.set({
      'Access-Control-Expose-Headers': 'Content-Disposition',
      'Content-Disposition': `attachment; filename="Subscribers Report - ${index + 1}.xlsx"`,
      'Content-Type': 'application/vnd.ms-excel',
    });

    const wb = new Excel.stream.xlsx.WorkbookWriter({
      stream: res,
      useStyles: true,
    });

    const ws = wb.addWorksheet('Sheet1');

    const rawHeader = ['Email'];

    const rows: string[][] = [[...rawHeader]];

    rows.forEach((row) => ws.addRow(row));

    ws.eachRow((row) => {
      row.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'ff000000' } },
          left: { style: 'thin', color: { argb: 'ff000000' } },
          bottom: { style: 'thin', color: { argb: 'ff000000' } },
          right: { style: 'thin', color: { argb: 'ff000000' } },
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'ffffc000' },
        };
      });
    });

    wsMergedCells(rows).forEach((m) => ws.mergeCells(m));

    async function createAndFillWorkbook(data) {
      const { email } = data;

      await ws.addRow([email]).commit();
    }

    await createAndFillWorkbook(doc);

    await cursor.eachAsync(createAndFillWorkbook);

    await ws.commit();

    await wb.commit();
  }
}
