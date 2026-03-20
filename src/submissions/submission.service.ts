import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Submission,
  SubmissionDocument,
  SubmissionStatus,
} from './schemas/submission.schema';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { ReviewSubmissionDto } from './dto/review-submission.dto';
import { AcademicModuleService } from '../academic-modules/academic-module.service';
import { Role } from '../users/schemas/user.schema';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectModel(Submission.name)
    private submissionModel: Model<SubmissionDocument>,
    private academicModuleService: AcademicModuleService,
  ) {}

  private populateFields() {
    return [
      { path: 'student', select: '-password' },
      { path: 'academicModule', select: 'name description school' },
      { path: 'reviewedBy', select: '-password' },
    ];
  }

  async create(dto: CreateSubmissionDto, userId: string) {
    const submission = new this.submissionModel({
      ...dto,
      student: userId,
    });
    return (await submission.save()).populate(this.populateFields());
  }

  async findMySubmissions(userId: string) {
    return this.submissionModel
      .find({ student: userId })
      .populate(this.populateFields())
      .exec();
  }

  async findByModule(moduleId: string, user: any) {
    if (user.role !== Role.MANAGER) {
      const isProfessor = await this.academicModuleService.isProfessor(
        moduleId,
        user.sub,
      );
      if (!isProfessor) {
        throw new ForbiddenException(
          'No tenés permisos para ver las entregas de este módulo',
        );
      }
    }

    return this.submissionModel
      .find({ academicModule: moduleId })
      .populate(this.populateFields())
      .exec();
  }

  async findById(id: string) {
    const submission = await this.submissionModel
      .findById(id)
      .populate(this.populateFields())
      .exec();
    if (!submission) {
      throw new NotFoundException('Entrega no encontrada');
    }
    return submission;
  }

  async review(id: string, dto: ReviewSubmissionDto, user: any) {
    const submission = await this.submissionModel.findById(id).exec();
    if (!submission) {
      throw new NotFoundException('Entrega no encontrada');
    }

    if (user.role !== Role.MANAGER) {
      const isProfessor = await this.academicModuleService.isProfessor(
        submission.academicModule.toString(),
        user.sub,
      );
      if (!isProfessor) {
        throw new ForbiddenException(
          'No tenés permisos para corregir esta entrega',
        );
      }
    }

    submission.status = dto.status;
    submission.feedback = dto.feedback || '';
    submission.reviewedBy = user.sub;
    submission.reviewedAt = new Date();

    await submission.save();
    return submission.populate(this.populateFields());
  }

  async delete(id: string) {
    const submission = await this.submissionModel
      .findByIdAndDelete(id)
      .exec();
    if (!submission) {
      throw new NotFoundException('Entrega no encontrada');
    }
    return { message: 'Entrega eliminada correctamente' };
  }
}
