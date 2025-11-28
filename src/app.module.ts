import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiConfigModule } from './modules/api-config/api-config.module';
import { ApiConfigService } from './modules/api-config/api-config.service';
import { TagModule } from './modules/tag/tag.module';
import { CategoryModule } from './modules/category/category.module';
import { PostModule } from './modules/post/post.module';
import { UserModule } from './modules/user/user.module';
import { CoreModule } from './modules/core/core.module';
import { AuthModule } from './modules/auth/auth.module';
import { LeadMagnetModule } from './modules/lead-magnet/lead-magnet.module';
import { UploadModule } from './modules/upload/upload.module';
@Module({
  imports: [
    ApiConfigModule,
    MongooseModule.forRootAsync({
      imports: [ApiConfigModule],
      useFactory: async (apiConfigService: ApiConfigService) => ({
        uri: apiConfigService.getMongodbUri,
      }),
      inject: [ApiConfigService],
    }),
    CoreModule,
    AuthModule,
    UserModule,
    PostModule,
    TagModule,
    CategoryModule,
    LeadMagnetModule,
    UploadModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {}
}
