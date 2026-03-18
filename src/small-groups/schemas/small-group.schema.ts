import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Group } from '../../groups/schemas/group.schema';
import { User } from '../../users/schemas/user.schema';

export type SmallGroupDocument = HydratedDocument<SmallGroup>;

@Schema({ timestamps: true })
export class SmallGroup {
    @Prop({ required: true })
    name: string;

    @Prop({ type: Types.ObjectId, ref: Group.name, required: true })
    group: Types.ObjectId;

    @Prop({ type: [{ type: Types.ObjectId, ref: User.name }], default: [] })
    leaders: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId, ref: User.name }], default: [] })
    participants: Types.ObjectId[];

    @Prop()
    description: string;

    createdAt: Date;
    updatedAt: Date;
}

export const SmallGroupSchema = SchemaFactory.createForClass(SmallGroup);
