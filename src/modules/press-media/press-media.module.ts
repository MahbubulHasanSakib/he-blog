import { Module } from '@nestjs/common';
import { PressMediaService } from './press-media.service';
import { PressMediaController } from './press-media.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PressMedia, PressMediaSchema } from './schema/press-media.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PressMedia.name, schema: PressMediaSchema },
    ]),
  ],
  controllers: [PressMediaController],
  providers: [PressMediaService],
})
export class PressMediaModule {}
