import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { MailService } from './mail.service';
import { ResponseInterceptor } from 'src/utils/response.interceptor';
import { ApiTags } from '@nestjs/swagger';
import { CreateContactMailDto } from './dto/contact-mail.dto';

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
    return this.mailService.sendEmail(
      body,
      'A new post is published',
      '<a href="https://hawkeyes-2-0.vercel.app/blog/how-to-appear-in-chatgpt-and-monitor-your-brands-performance-1/">Click here to see the post</a>',
      'not-attached',
    );
  }

  @Post('/contact')
  sendEmailFromContactForm(@Body() contactFormDto: CreateContactMailDto) {
    let body = {
      email: 'mahbubul@hedigital.tech',
    };
    return this.mailService.sendEmail(
      body,
      'A new enquiry from hedigital.tech',
      `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Inquiry</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">
    
    <table align="center" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f4; padding:20px 0;">
        <tr>
            <td align="center">
                
                <!-- Container -->
                <table width="600" cellspacing="0" cellpadding="0" style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.1);">

                    <!-- Header -->
                    <tr>
                        <td align="center" style="background:#1a1a1a; padding:20px;">
                            <h1 style="color:#ffffff; margin:0; font-size:22px;">New Inquiry</h1>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:20px; color:#333333; font-size:14px; line-height:22px;">
                            <p>Hello,</p>
                            <p>You have received a new  inquiry. Here are the details:</p>

                            <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin-top:15px;">
                                <tr>
                                    <th align="left" style="background:#f8f8f8; padding:10px; border-bottom:1px solid #ddd;">Full Name</th>
                                    <td style="padding:10px; border-bottom:1px solid #ddd;">${contactFormDto.fullName}</td>
                                </tr>
                                <tr>
                                    <th align="left" style="background:#f8f8f8; padding:10px; border-bottom:1px solid #ddd;">Company Name</th>
                                    <td style="padding:10px; border-bottom:1px solid #ddd;">${contactFormDto.companyName}</td>
                                </tr>
                                <tr>
                                    <th align="left" style="background:#f8f8f8; padding:10px; border-bottom:1px solid #ddd;">Email</th>
                                    <td style="padding:10px; border-bottom:1px solid #ddd;">${contactFormDto.userEmail}</td>
                                </tr>
                                <tr>
                                    <th align="left" style="background:#f8f8f8; padding:10px; border-bottom:1px solid #ddd;">Service Required</th>
                                    <td style="padding:10px; border-bottom:1px solid #ddd;">${contactFormDto.serviceRequired}</td>
                                </tr>
                                <tr>
                                    <th align="left" style="background:#f8f8f8; padding:10px; border-bottom:1px solid #ddd;">Project Budget</th>
                                    <td style="padding:10px; border-bottom:1px solid #ddd;">${contactFormDto.projectBudget}</td>
                                </tr>
                                <tr>
                                    <th align="left" style="background:#f8f8f8; padding:10px; border-bottom:1px solid #ddd;">Project Details</th>
                                    <td style="padding:10px; border-bottom:1px solid #ddd;">${contactFormDto.projectDetails}</td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding: 20px 40px 40px; background-color: #121212;">

                            <!-- Social Icons -->
                            <p style="margin: 20px 0 0 0; text-align: center;">
                                <a href="https://www.linkedin.com/company/hedigital-tech/" target="_blank" style="margin: 0 5px;">
                                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRHqvUv15Yv-jy95oOHmX9eCXRlfjW8jZIag&s" 
                                         alt="LinkedIn" width="24" height="24" style="vertical-align: middle;">
                                </a>
                                <a href="https://www.facebook.com/hedigital.tech/" target="_blank" style="margin: 0 5px;">
                                    <img src="https://img.freepik.com/premium-vector/social-media-icon-illustration-facebook-facebook-icon-vector-illustration_561158-2134.jpg?semt=ais_se_enriched&w=740&q=80" 
                                         alt="Facebook" width="24" height="24" style="vertical-align: middle;">
                                </a>
                            </p>

                            <!-- Address -->
                            <p style="font-size: 14px; color: #cccccc; margin: 15px 0 10px;">
                                HawkEyes Digital Monitoring Ltd<br>
                                2nd Floor, House 05, Road 12, Sector 1<br>
                                Uttara, Dhaka 1230
                            </p>

                        

                            <!-- Copyright -->
                            <p style="font-size: 12px; color: #666666; margin: 0;">
                                &copy; 2025 HawkEyes Digital. All rights reserved.
                            </p>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>`,
      'not-attached',
    );
  }
}
