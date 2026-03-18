import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Group } from '../../groups/schemas/group.schema';

export type ManagerDocument = HydratedDocument<Manager>;

export enum Role {
  MANAGER = 'manager',
  USER = 'user',
  COUNSELOR = 'counselor',
  LIDER = 'lider',
}

@Schema({ timestamps: true })
export class Manager {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: Role, default: Role.USER })
  role: Role;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: Group.name }], default: [] })
  assignedGroups: Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

export const ManagerSchema = SchemaFactory.createForClass(Manager);
