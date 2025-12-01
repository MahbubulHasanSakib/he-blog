import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLeadMagnetDto } from './dto/create-lead-magnet.dto';
import { UpdateLeadMagnetDto } from './dto/update-lead-magnet.dto';
import { InjectModel } from '@nestjs/mongoose';
import { LeadMagnet, LeadMagnetDocument } from './schema/lead-magnet.schema';
import { Model } from 'mongoose';
import { CreateLeadMagnetRequestDto } from './dto/create-lead-magnet-request.dto';
import {
  LeadDocument,
  LeadMagnetRequest,
} from './schema/lead-magnet-request.schema';
import { MailService } from '../mail/mail.service';

@Injectable()
export class LeadMagnetService {
  constructor(
    @InjectModel(LeadMagnet.name)
    private readonly leadMagnetModel: Model<LeadMagnetDocument>,
    @InjectModel(LeadMagnetRequest.name)
    private readonly leadRequestModel: Model<LeadDocument>,
    private readonly mailService: MailService,
  ) {}

  async create(createLeadMagnetDto: CreateLeadMagnetDto) {
    const data = await this.leadMagnetModel.create(createLeadMagnetDto);
    return { data: data };
  }

  async findAll() {
    let data = await this.leadMagnetModel.find().sort({ createdAt: -1 }).exec();
    return { data };
  }

  async findOne(id: string) {
    const lead = await this.leadMagnetModel.findById(id).exec();
    if (!lead) throw new NotFoundException('Lead magnet not found');
    return { data: lead };
  }

  async update(id: string, updateLeadMagnetDto: UpdateLeadMagnetDto) {
    const updated = await this.leadMagnetModel
      .findByIdAndUpdate(id, updateLeadMagnetDto, { new: true })
      .exec();

    if (!updated) throw new NotFoundException('Lead magnet not found');
    return { data: updated };
  }

  async remove(id: string) {
    const deleted = await this.leadMagnetModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Lead magnet not found');
    return { message: 'Lead magnet deleted successfully' };
  }

  async createRequest(dto: CreateLeadMagnetRequestDto) {
    const mailInfo = {
      fileUrl: dto.fileUrl,
      fileName: dto.fileName,
      email: dto.email,
    };

    let emailSentAt: Date | undefined;

    try {
      await this.mailService.sendEmail(mailInfo);
      emailSentAt = new Date();
    } catch (err) {
      console.error('Failed to send email:', err.message);
    }

    // Create lead request document
    const record = {
      ...dto,
      ...(emailSentAt ? { emailSentAt } : {}),
    };

    const data = await this.leadRequestModel.create(record);

    return { data };
  }
}
