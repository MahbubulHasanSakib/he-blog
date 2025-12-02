import { Module } from '@nestjs/common';
import { SubscribeService } from './subscribe.service';
import { SubscribeController } from './subscribe.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Subscribe, SubscribeSchema } from './schema/subscribe.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Subscribe.name,
        schema: SubscribeSchema,
      },
    ]),
  ],
  controllers: [SubscribeController],
  providers: [SubscribeService],
  exports: [MongooseModule],
})
export class SubscribeModule {}
