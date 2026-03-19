import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type GroupDocument = HydratedDocument<Group>;

@Schema({ timestamps: true })
export class Group {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: User.name }], default: [] })
  managers: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: User.name }], default: [] })
  collaborators: Types.ObjectId[];

  @Prop()
  description: string;

  createdAt: Date;
  updatedAt: Date;
}

export const GroupSchema = SchemaFactory.createForClass(Group);
