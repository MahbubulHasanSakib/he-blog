import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt'; // <-- Added
import { User } from '../schemas/user.schema';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { IUser } from '../interfaces/user.interface';
import * as mongoose from 'mongoose';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  // CREATE
  async create(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.userModel.create({
      ...dto,
      password: hashedPassword,
    });

    return { data: user };
  }

  async findAll() {
    let users = this.userModel.find({ deletedAt: null }).exec();
    return { data: users };
  }

  async findOne(id: string) {
    const user = await this.userModel.findOne({ _id: id, deletedAt: null });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { data: user };
  }

  async update(id: string, dto: UpdateUserDto) {
    const updateData: any = { ...dto };

    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    const user = await this.userModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: updateData },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { data: user };
  }

  async remove(id: string) {
    const result = await this.userModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true },
    );

    if (!result) throw new NotFoundException('User not found');

    return { message: 'User deleted successfully' };
  }

  async getWhoAmI(user: IUser) {
    const userData = await this.userModel.findOne(
      { _id: user._id, deletedAt: null },
      { password: 0, deletedAt: 0, createdAt: 0, updatedAt: 0 },
    );

    if (!userData) {
      throw new NotFoundException('User not found');
    }

    return { data: userData };
  }
}
