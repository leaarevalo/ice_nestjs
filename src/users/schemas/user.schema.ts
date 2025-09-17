import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  document: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  email: string;

  @Prop({ required: false })
  dateOfBirth: string;

  @Prop({ required: true })
  history: string;

  @Prop({ required: false })
  dateOfConversion: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
