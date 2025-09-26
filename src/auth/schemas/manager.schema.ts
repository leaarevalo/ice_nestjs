import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ManagerDocument = HydratedDocument<Manager>;

enum Role {
  MANAGER = 'manager',
  USER = 'user',
}

@Schema({ timestamps: true })
export class Manager {
  @Prop({ required: true, unique: true })
  document: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  dateOfBirth: string;

  @Prop({ required: true })
  dateOfConversion: string;

  @Prop({ required: true })
  civilState: string;

  @Prop()
  marriageDate: string;

  @Prop({ required: true })
  belongToCelula: string;

  @Prop({ required: true })
  belongToGroup: string;

  @Prop()
  history: string;

  @Prop({ enum: Role, default: Role.USER })
  role: Role;
}

export const ManagerSchema = SchemaFactory.createForClass(Manager);
