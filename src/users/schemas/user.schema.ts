import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  document: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: false })
  email: string;

  @Prop({ required: false })
  phone: string;

  @Prop({ required: false })
  address: string;

  @Prop({ required: false })
  dateOfBirth: string;

  @Prop({ required: false })
  dateOfConversion: string;

  @Prop({ required: false })
  civilState: string;

  @Prop({ required: false })
  marriageDate: string;

  @Prop({ required: false })
  studyStatus: string;

  @Prop({ required: false })
  ocupation: string;

  @Prop({ required: false })
  hasSocialWork: boolean;

  @Prop({ required: false })
  numberOfChilds: number;

  @Prop({ required: false })
  tutorInfo: string;

  @Prop({ default: false })
  isLider: boolean;


  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
