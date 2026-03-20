import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { AcademicModule } from '../../academic-modules/schemas/academic-module.schema';

export type SubmissionDocument = HydratedDocument<Submission>;

export enum SubmissionStatus {
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class Submission {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  student: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: AcademicModule.name, required: true })
  academicModule: Types.ObjectId;

  @Prop({ required: true })
  fileUrl: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({
    enum: SubmissionStatus,
    default: SubmissionStatus.PENDING_REVIEW,
  })
  status: SubmissionStatus;

  @Prop()
  feedback: string;

  @Prop({ type: Types.ObjectId, ref: User.name })
  reviewedBy: Types.ObjectId;

  @Prop()
  reviewedAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);
