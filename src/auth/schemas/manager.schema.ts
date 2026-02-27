import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ManagerDocument = HydratedDocument<Manager>;

export enum Role {
  MANAGER = 'manager',
  USER = 'user',
  COUNSELOR = 'counselor',
}

@Schema({ timestamps: true })
export class Manager {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: Role, default: Role.USER })
  role: Role;

  createdAt: Date;
  updatedAt: Date;
}

export const ManagerSchema = SchemaFactory.createForClass(Manager);
