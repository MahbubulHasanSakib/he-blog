import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { LeadMagnetModule } from '../lead-magnet/lead-magnet.module';
import { UserModule } from '../user/user.module';
import { SubscribeModule } from '../subscribe/subscribe.module';

@Module({
  imports: [LeadMagnetModule, UserModule, SubscribeModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
