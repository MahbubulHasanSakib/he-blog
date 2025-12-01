import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { MailService } from './mail.service';
import { ResponseInterceptor } from 'src/utils/response.interceptor';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('mail')
@UseInterceptors(ResponseInterceptor)
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}
  @Get('/sendEmail')
  sendEmail() {
    let body = {
      fileUrl:
        'https://mlenzdevsa.blob.core.windows.net/mlenz-dev-data/uploads/resource/02-02-2024/kubernetes_certifiacate.pdf',
      fileName: 'kubernetes_certifiacate',
      email: 'mahbubulhasan179@gmail.com',
    };
    return this.mailService.sendEmail(body);
  }
}
