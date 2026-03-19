import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum Role {
  MANAGER = 'manager',
  USER = 'user',
  COUNSELOR = 'counselor',
  LIDER = 'lider',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  document: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: Role, default: Role.USER })
  role: Role;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Group' }], default: [] })
  assignedGroups: Types.ObjectId[];

  @Prop()
  email: string;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  @Prop()
  dateOfBirth: string;

  @Prop()
  dateOfConversion: string;

  @Prop()
  civilState: string;

  @Prop()
  marriageDate: string;

  @Prop()
  studyStatus: string;

  @Prop()
  ocupation: string;

  @Prop()
  hasSocialWork: boolean;

  @Prop()
  numberOfChilds: number;

  @Prop()
  tutorInfo: string;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
