import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ApiConfigModule } from 'src/modules/api-config/api-config.module';
import { ApiConfigService } from 'src/modules/api-config/api-config.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ApiConfigModule],
      useFactory: (apiConfigService: ApiConfigService) => {
        const host = apiConfigService.getEmailHost;
        const user = apiConfigService.getEmailUser;
        const pass = apiConfigService.getEmailPassword;
        const port = apiConfigService.getEmailPort || 587;
        const secure = port === 465;

        const isEmailConfigValid = host && user && pass;

        if (!isEmailConfigValid) {
          console.warn(
            '[MailerModule] Email config missing — using streamTransport (no emails will be sent)',
          );
          return {
            transport: {
              streamTransport: true,
              newline: 'unix',
              buffer: true,
            },
            defaults: {
              from: '"No Reply" <noreply@example.com>',
            },
          };
        }

        return {
          transport: {
            host,
            port,
            secure,
            auth: { user, pass },
          },
          defaults: {
            from: `"No Reply" <${user}>`,
          },
        };
      },
      inject: [ApiConfigService],
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
