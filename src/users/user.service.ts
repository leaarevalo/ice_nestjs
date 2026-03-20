import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, Role } from './schemas/user.schema';
import { Group, GroupDocument } from '../groups/schemas/group.schema';
import {
  Enrollment,
  EnrollmentDocument,
} from '../enrollments/schemas/enrollment.schema';
import {
  AcademicModule,
  AcademicModuleDocument,
} from '../academic-modules/schemas/academic-module.schema';
import { CreateUserDto } from './dto/user.controller.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(AcademicModule.name)
    private academicModuleModel: Model<AcademicModuleDocument>,
  ) {}

  async getUsers(requestUser: {
    sub?: string;
    role: Role;
    assignedGroups?: string[];
  }): Promise<User[]> {
    if (requestUser.role === Role.LIDER) {
      return this.getUsersByAssignedGroups(requestUser.assignedGroups || []);
    }
    if (requestUser.role === Role.USER) {
      return this.getUsersByEnrolledSchools(requestUser.sub);
    }
    return this.userModel.find().select('-password').exec();
  }

  private async getUsersByEnrolledSchools(userId: string): Promise<User[]> {
    const myEnrollments = await this.enrollmentModel
      .find({ student: userId })
      .select('school')
      .exec();
    const schoolIds = myEnrollments.map((e) => e.school.toString());

    if (schoolIds.length === 0) {
      return [];
    }

    // Get all students enrolled in the same schools
    const fellowEnrollments = await this.enrollmentModel
      .find({ school: { $in: schoolIds } })
      .select('student')
      .exec();
    const userIds = new Set<string>(
      fellowEnrollments.map((e) => e.student.toString()),
    );

    // Get all professors of modules in those schools
    const modules = await this.academicModuleModel
      .find({ school: { $in: schoolIds } })
      .select('professors')
      .exec();
    for (const mod of modules) {
      mod.professors.forEach((p) => userIds.add(p.toString()));
    }

    return this.userModel
      .find({ _id: { $in: [...userIds] } })
      .select('-password')
      .exec();
  }

  private async getUsersByAssignedGroups(
    assignedGroups: any[],
  ): Promise<User[]> {
    const groupIds = assignedGroups.map((g) =>
      typeof g === 'object' && g._id ? g._id.toString() : g.toString(),
    );

    const groups = await this.groupModel
      .find({ _id: { $in: groupIds } })
      .exec();

    const userIds = new Set<string>();
    for (const group of groups) {
      group.managers.forEach((id) => userIds.add(id.toString()));
      group.collaborators.forEach((id) => userIds.add(id.toString()));
    }

    return this.userModel
      .find({ _id: { $in: [...userIds] } })
      .select('-password')
      .exec();
  }

  async getUserById(id: string) {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async createUser(dto: CreateUserDto) {
    const existing = await this.userModel
      .findOne({ document: dto.document })
      .exec();

    if (existing) {
      throw new ConflictException('Ya existe un usuario con ese documento');
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(dto.password, salt);

    const newUser = new this.userModel({
      ...dto,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    const userObj = savedUser.toObject();
    delete userObj.password;
    return userObj;
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const currentUser = await this.userModel.findById(id).exec();
    if (!currentUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (dto.password) {
      const salt = bcrypt.genSaltSync(10);
      dto.password = bcrypt.hashSync(dto.password, salt);
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, dto, { new: true })
      .select('-password')
      .exec();

    return user;
  }

  async deleteUser(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.userModel.findByIdAndDelete(id).exec();
    return { message: 'Usuario eliminado correctamente' };
  }

  async getUserIdsByDocuments(documents: string[]): Promise<string[]> {
    if (!documents || documents.length === 0) return [];

    const users = await this.userModel
      .find({ document: { $in: documents } })
      .exec();

    if (users.length !== documents.length) {
      throw new ConflictException(
        'Uno o más documentos enviados no pertenecen a usuarios registrados',
      );
    }

    return users.map((user) => user._id.toString());
  }
}
