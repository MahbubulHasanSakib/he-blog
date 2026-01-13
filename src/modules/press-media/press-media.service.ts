import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePressMediaDto } from './dto/create-press-media.dto';
import { UpdatePressMediaDto } from './dto/update-press-media.dto';
import { InjectModel } from '@nestjs/mongoose';
import { PressMedia, PressMediaDocument } from './schema/press-media.schema';
import { Model } from 'mongoose';

@Injectable()
export class PressMediaService {
  constructor(
    @InjectModel(PressMedia.name)
    private readonly pressMediaModel: Model<PressMediaDocument>,
  ) {}

  // Create a new Press & Media item
  async create(createPressMediaDto: CreatePressMediaDto) {
    const newItem = await this.pressMediaModel.create(createPressMediaDto);
    return { data: newItem };
  }

  // Get all Press & Media items
  async findAll() {
    let items = await this.pressMediaModel
      .find({ deletedAt: null })
      .sort({ createdAt: -1 })
      .exec();
    return { data: items };
  }

  // Get a single Press & Media item by ID
  async findOne(id: string) {
    const item = await this.pressMediaModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException(`PressMedia with ID ${id} not found`);
    }
    return { data: item };
  }

  async update(id: string, updatePressMediaDto: UpdatePressMediaDto) {
    const updatedItem = await this.pressMediaModel
      .findByIdAndUpdate(id, updatePressMediaDto, { new: true })
      .exec();
    if (!updatedItem) {
      throw new NotFoundException(`PressMedia with ID ${id} not found`);
    }
    return { data: updatedItem };
  }

  // Delete a Press & Media item by ID
  async remove(id: string) {
    const deletedItem = await this.pressMediaModel.findByIdAndDelete(id).exec();
    if (!deletedItem) {
      throw new NotFoundException(`PressMedia with ID ${id} not found`);
    }
    return { data: deletedItem };
  }
}
