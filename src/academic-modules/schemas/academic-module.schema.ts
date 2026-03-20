import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { School } from '../../schools/schemas/school.schema';

export type AcademicModuleDocument = HydratedDocument<AcademicModule>;

@Schema({ timestamps: true })
export class AcademicModule {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: School.name, required: true })
  school: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: User.name }], default: [] })
  professors: Types.ObjectId[];

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ type: [String], default: [] })
  materialLinks: string[];

  createdAt: Date;
  updatedAt: Date;
}

export const AcademicModuleSchema =
  SchemaFactory.createForClass(AcademicModule);
