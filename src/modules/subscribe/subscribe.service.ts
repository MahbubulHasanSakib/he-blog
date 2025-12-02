import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubscribeDto } from './dto/create-subscribe.dto';
import { UpdateSubscribeDto } from './dto/update-subscribe.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Subscribe, SubscribeDocument } from './schema/subscribe.schema';
import { Model } from 'mongoose';

@Injectable()
export class SubscribeService {
  constructor(
    @InjectModel(Subscribe.name)
    private readonly subscribeModel: Model<SubscribeDocument>,
  ) {}
  async create(createSubscribeDto: CreateSubscribeDto) {
    const createdSubscribe =
      await this.subscribeModel.create(createSubscribeDto);
    return { data: createdSubscribe };
  }

  async findAll() {
    let data = await this.subscribeModel.find().exec();
    return { data };
  }

  async findOne(id: string) {
    const subscribe = await this.subscribeModel.findById(id).exec();
    if (!subscribe) {
      throw new NotFoundException(`Subscribe with ID ${id} not found`);
    }
    return { data: subscribe };
  }

  async update(id: string, updateSubscribeDto: UpdateSubscribeDto) {
    const updatedSubscribe = await this.subscribeModel
      .findByIdAndUpdate(id, updateSubscribeDto, { new: true })
      .exec();
    if (!updatedSubscribe) {
      throw new NotFoundException(`Subscribe with ID ${id} not found`);
    }
    return { data: updatedSubscribe };
  }

  async remove(id: string) {
    const result = await this.subscribeModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Subscribe with ID ${id} not found`);
    }
    return { message: 'Subscribe deleted successfully' };
  }
}
