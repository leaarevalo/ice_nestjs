import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type SchoolDocument = HydratedDocument<School>;

@Schema({ timestamps: true })
export class School {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdBy: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const SchoolSchema = SchemaFactory.createForClass(School);
