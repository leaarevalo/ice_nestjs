import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Enrollment,
  EnrollmentDocument,
  EnrollmentStatus,
  ModuleResultStatus,
} from './schemas/enrollment.schema';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateModuleResultDto } from './dto/update-module-result.dto';
import { UserService } from '../users/user.service';
import { AcademicModuleService } from '../academic-modules/academic-module.service';
import { Role } from '../users/schemas/user.schema';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    private userService: UserService,
    private academicModuleService: AcademicModuleService,
  ) {}

  private populateFields() {
    return [
      { path: 'student', select: '-password' },
      { path: 'school', select: 'name description' },
      { path: 'moduleResults.academicModule', select: 'name description order' },
    ];
  }

  async create(dto: CreateEnrollmentDto, user: any) {
    if (user.role !== Role.MANAGER) {
      const isProfessor = await this.academicModuleService.isProfessorInSchool(
        dto.school,
        user.sub,
      );
      if (!isProfessor) {
        throw new ForbiddenException(
          'No tenés permisos para inscribir alumnos en esta escuela',
        );
      }
    }

    const studentIds = await this.userService.getUserIdsByDocuments([
      dto.studentDocument,
    ]);
    const studentId = studentIds[0];

    const studentIsProfessor =
      await this.academicModuleService.isProfessorInSchool(
        dto.school,
        studentId,
      );
    if (studentIsProfessor) {
      throw new ConflictException(
        'No se puede inscribir como estudiante a un profesor de esta escuela',
      );
    }

    const existing = await this.enrollmentModel
      .findOne({ student: studentId, school: dto.school })
      .exec();
    if (existing) {
      throw new ConflictException(
        'El estudiante ya está inscripto en esta escuela',
      );
    }

    const modules = await this.academicModuleService.findBySchool(dto.school);
    const moduleResults = modules.map((mod: any) => ({
      academicModule: mod._id,
      status: ModuleResultStatus.PENDING,
    }));

    const enrollment = new this.enrollmentModel({
      student: studentId,
      school: dto.school,
      moduleResults,
    });

    return (await enrollment.save()).populate(this.populateFields());
  }

  async findAll() {
    return this.enrollmentModel
      .find()
      .populate(this.populateFields())
      .exec();
  }

  async findBySchool(schoolId: string) {
    return this.enrollmentModel
      .find({ school: schoolId })
      .populate(this.populateFields())
      .exec();
  }

  async findMyEnrollments(userId: string) {
    return this.enrollmentModel
      .find({ student: userId })
      .populate(this.populateFields())
      .exec();
  }

  async findById(id: string) {
    const enrollment = await this.enrollmentModel
      .findById(id)
      .populate(this.populateFields())
      .exec();
    if (!enrollment) {
      throw new NotFoundException('Inscripción no encontrada');
    }
    return enrollment;
  }

  async updateModuleResult(
    enrollmentId: string,
    dto: UpdateModuleResultDto,
    user: any,
  ) {
    const enrollment = await this.enrollmentModel.findById(enrollmentId).exec();
    if (!enrollment) {
      throw new NotFoundException('Inscripción no encontrada');
    }

    if (user.role !== Role.MANAGER) {
      const isProfessor = await this.academicModuleService.isProfessor(
        dto.academicModule,
        user.sub,
      );
      if (!isProfessor) {
        throw new ForbiddenException(
          'No tenés permisos para calificar este módulo',
        );
      }
    }

    const moduleResult = enrollment.moduleResults.find(
      (mr) => mr.academicModule.toString() === dto.academicModule,
    );

    if (!moduleResult) {
      throw new NotFoundException(
        'El módulo no está asociado a esta inscripción',
      );
    }

    moduleResult.status = dto.status;

    const allApproved = enrollment.moduleResults.every(
      (mr) => mr.status === ModuleResultStatus.APPROVED,
    );
    if (allApproved) {
      enrollment.status = EnrollmentStatus.COMPLETED;
    }

    await enrollment.save();
    return enrollment.populate(this.populateFields());
  }

  async updateStatus(enrollmentId: string, status: EnrollmentStatus) {
    const enrollment = await this.enrollmentModel
      .findByIdAndUpdate(enrollmentId, { status }, { new: true })
      .populate(this.populateFields())
      .exec();
    if (!enrollment) {
      throw new NotFoundException('Inscripción no encontrada');
    }
    return enrollment;
  }

  async delete(id: string, user: any) {
    const enrollment = await this.enrollmentModel.findById(id).exec();
    if (!enrollment) {
      throw new NotFoundException('Inscripción no encontrada');
    }

    if (user.role !== Role.MANAGER) {
      const isProfessor = await this.academicModuleService.isProfessorInSchool(
        enrollment.school.toString(),
        user.sub,
      );
      if (!isProfessor) {
        throw new ForbiddenException(
          'No tenés permisos para desinscribir alumnos de esta escuela',
        );
      }
    }

    await this.enrollmentModel.findByIdAndDelete(id).exec();
    return { message: 'Inscripción eliminada correctamente' };
  }
}
