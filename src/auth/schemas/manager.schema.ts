import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ManagerDocument = HydratedDocument<Manager>;

enum Role {
  MANAGER = 'manager',
  USER = 'user',
}

@Schema()
export class Manager {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: Role, default: Role.USER })
  role: Role;
}

export const ManagerSchema = SchemaFactory.createForClass(Manager);
