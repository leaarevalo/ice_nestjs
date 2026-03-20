import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AcademicModule,
  AcademicModuleDocument,
} from './schemas/academic-module.schema';
import {
  Enrollment,
  EnrollmentDocument,
} from '../enrollments/schemas/enrollment.schema';
import { CreateAcademicModuleDto } from './dto/create-academic-module.dto';
import { UpdateAcademicModuleDto } from './dto/update-academic-module.dto';
import { UserService } from '../users/user.service';
import { Role } from '../users/schemas/user.schema';

@Injectable()
export class AcademicModuleService {
  constructor(
    @InjectModel(AcademicModule.name)
    private academicModuleModel: Model<AcademicModuleDocument>,
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    private userService: UserService,
  ) {}

  private populateFields() {
    return [
      { path: 'school', select: 'name description' },
      { path: 'professors', select: '-password' },
    ];
  }

  async create(dto: CreateAcademicModuleDto) {
    const existing = await this.academicModuleModel
      .findOne({ name: dto.name, school: dto.school })
      .exec();
    if (existing) {
      throw new ConflictException(
        'Ya existe un módulo con ese nombre en esta escuela',
      );
    }

    if (dto.professors && dto.professors.length > 0) {
      dto.professors = await this.userService.getUserIdsByDocuments(
        dto.professors,
      );
    }

    const academicModule = new this.academicModuleModel(dto);
    return (await academicModule.save()).populate(this.populateFields());
  }

  private async getEnrolledSchoolIds(userId: string): Promise<string[]> {
    const enrollments = await this.enrollmentModel
      .find({ student: userId })
      .select('school')
      .exec();
    return enrollments.map((e) => e.school.toString());
  }

  async findAll(user: any) {
    if (user.role === Role.MANAGER) {
      return this.academicModuleModel
        .find()
        .populate(this.populateFields())
        .exec();
    }

    // Professors see modules they teach + modules from schools they're enrolled in
    const enrolledSchoolIds = await this.getEnrolledSchoolIds(user.sub);

    return this.academicModuleModel
      .find({
        $or: [
          { professors: user.sub },
          { school: { $in: enrolledSchoolIds } },
        ],
      })
      .populate(this.populateFields())
      .exec();
  }

  async findBySchool(schoolId: string, user?: any) {
    if (user && user.role !== Role.MANAGER) {
      const isProfessor = await this.isProfessorInSchool(schoolId, user.sub);
      const enrolledSchoolIds = await this.getEnrolledSchoolIds(user.sub);
      const isEnrolled = enrolledSchoolIds.includes(schoolId);

      if (!isProfessor && !isEnrolled) {
        throw new ForbiddenException(
          'No tenés permisos para ver los módulos de esta escuela',
        );
      }
    }

    return this.academicModuleModel
      .find({ school: schoolId })
      .sort({ order: 1 })
      .populate(this.populateFields())
      .exec();
  }

  async findById(id: string, user?: any) {
    const academicModule = await this.academicModuleModel
      .findById(id)
      .populate(this.populateFields())
      .exec();
    if (!academicModule) {
      throw new NotFoundException('Módulo académico no encontrado');
    }

    if (user && user.role !== Role.MANAGER) {
      const schoolId = (academicModule.school as any)?._id?.toString() ||
        academicModule.school.toString();
      const isProfessor = academicModule.professors.some(
        (p: any) => (p._id?.toString() || p.toString()) === user.sub,
      );
      const enrolledSchoolIds = await this.getEnrolledSchoolIds(user.sub);
      const isEnrolled = enrolledSchoolIds.includes(schoolId);

      if (!isProfessor && !isEnrolled) {
        throw new ForbiddenException(
          'No tenés permisos para ver este módulo',
        );
      }
    }

    return academicModule;
  }

  async update(id: string, dto: UpdateAcademicModuleDto, user: any) {
    const existing = await this.academicModuleModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException('Módulo académico no encontrado');
    }

    if (user.role !== Role.MANAGER) {
      const isProfessor = existing.professors.some(
        (p) => p.toString() === user.sub,
      );
      if (!isProfessor) {
        throw new ForbiddenException(
          'No tenés permisos para actualizar este módulo',
        );
      }
    }

    if (dto.professors && dto.professors.length > 0) {
      dto.professors = await this.userService.getUserIdsByDocuments(
        dto.professors,
      );
    }

    const academicModule = await this.academicModuleModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate(this.populateFields())
      .exec();

    return academicModule;
  }

  async delete(id: string) {
    const academicModule = await this.academicModuleModel
      .findByIdAndDelete(id)
      .exec();
    if (!academicModule) {
      throw new NotFoundException('Módulo académico no encontrado');
    }
    return { message: 'Módulo académico eliminado correctamente' };
  }

  async isProfessor(moduleId: string, userId: string): Promise<boolean> {
    const mod = await this.academicModuleModel.findById(moduleId).exec();
    if (!mod) return false;
    return mod.professors.some((p) => p.toString() === userId);
  }

  async isProfessorInSchool(
    schoolId: string,
    userId: string,
  ): Promise<boolean> {
    const count = await this.academicModuleModel
      .countDocuments({ school: schoolId, professors: userId })
      .exec();
    return count > 0;
  }
}
