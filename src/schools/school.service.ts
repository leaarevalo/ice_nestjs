import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { School, SchoolDocument } from './schemas/school.schema';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class SchoolService {
  constructor(
    @InjectModel(School.name) private schoolModel: Model<SchoolDocument>,
  ) {}

  async create(dto: CreateSchoolDto, userId: string) {
    const existing = await this.schoolModel.findOne({ name: dto.name }).exec();
    if (existing) {
      throw new ConflictException('Ya existe una escuela con ese nombre');
    }

    const school = new this.schoolModel({ ...dto, createdBy: userId });
    return (await school.save()).populate('createdBy', '-password');
  }

  async findAll() {
    return this.schoolModel
      .find()
      .populate('createdBy', '-password')
      .exec();
  }

  async findById(id: string) {
    const school = await this.schoolModel
      .findById(id)
      .populate('createdBy', '-password')
      .exec();
    if (!school) {
      throw new NotFoundException('Escuela no encontrada');
    }
    return school;
  }

  async update(id: string, dto: UpdateSchoolDto) {
    const school = await this.schoolModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('createdBy', '-password')
      .exec();
    if (!school) {
      throw new NotFoundException('Escuela no encontrada');
    }
    return school;
  }

  async delete(id: string) {
    const school = await this.schoolModel.findByIdAndDelete(id).exec();
    if (!school) {
      throw new NotFoundException('Escuela no encontrada');
    }
    return { message: 'Escuela eliminada correctamente' };
  }
}
