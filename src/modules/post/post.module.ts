import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { CategoryModule } from '../category/category.module';
import { TagModule } from '../tag/tag.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schema/post.schema';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [
    CategoryModule,
    TagModule,
    UserModule,
    TagModule,
    ActivityModule,
    MongooseModule.forFeature([
      {
        name: Post.name,
        schema: PostSchema,
      },
    ]),
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [MongooseModule, PostService],
})
export class PostModule {}
