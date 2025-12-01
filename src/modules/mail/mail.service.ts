import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ApiConfigService } from '../api-config/api-config.service';
import axios from 'axios';
@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private apiConfigService: ApiConfigService,
  ) {}
  detectMimeType(buffer: Buffer): string {
    const signature = buffer.subarray(0, 4).toString('hex').toUpperCase();

    // JPEG signatures
    if (
      signature.startsWith('FFD8FFE0') ||
      signature.startsWith('FFD8FFE1') ||
      signature.startsWith('FFD8FFE2')
    ) {
      return 'image/jpeg';
    }

    // PNG
    if (signature === '89504E47') return 'image/png';

    // GIF
    if (signature === '47494638') return 'image/gif';

    // PDF
    if (signature === '25504446') return 'application/pdf';

    // ZIP / DOCX / XLSX / PPTX
    if (signature === '504B0304') return 'application/zip';

    return 'application/octet-stream'; // default
  }
  async sendEmail(body) {
    console.log(body);
    const { fileName, fileUrl, email } = body;

    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const fileBuffer = response.data;

    // 2️⃣ Detect mime manually
    let mimeType = this.detectMimeType(fileBuffer);

    // 3️⃣ Convert JPEG → JPG (as you requested)
    if (mimeType === 'image/jpeg') {
      mimeType = 'image/jpg';
    }

    // 4️⃣ Generate extension
    const extMap: any = {
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'application/pdf': 'pdf',
      'application/zip': 'zip',
    };

    const fileExt = extMap[mimeType] || 'bin';
    console.log(mimeType);
    try {
      await this.mailerService.sendMail({
        to: email,
        from: this.apiConfigService.getEmailUser,
        subject: 'Test mail',
        html: '<h2>Testing</h2>',
        attachments: [
          {
            filename: `attachment.${fileExt}`,
            content: fileBuffer,
            contentType: mimeType,
          },
        ],
      });

      return { message: 'Mail sent successfully' };
    } catch (error) {
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }
}
