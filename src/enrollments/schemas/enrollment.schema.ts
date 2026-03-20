import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { School } from '../../schools/schemas/school.schema';
import { AcademicModule } from '../../academic-modules/schemas/academic-module.schema';

export type EnrollmentDocument = HydratedDocument<Enrollment>;

export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
}

export enum ModuleResultStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  APPROVED = 'approved',
  FAILED = 'failed',
}

@Schema({ _id: false })
export class ModuleResult {
  @Prop({ type: Types.ObjectId, ref: AcademicModule.name, required: true })
  academicModule: Types.ObjectId;

  @Prop({
    enum: ModuleResultStatus,
    default: ModuleResultStatus.PENDING,
  })
  status: ModuleResultStatus;
}

export const ModuleResultSchema = SchemaFactory.createForClass(ModuleResult);

@Schema({ timestamps: true })
export class Enrollment {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  student: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: School.name, required: true })
  school: Types.ObjectId;

  @Prop({
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVE,
  })
  status: EnrollmentStatus;

  @Prop({ type: [ModuleResultSchema], default: [] })
  moduleResults: ModuleResult[];

  createdAt: Date;
  updatedAt: Date;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);
