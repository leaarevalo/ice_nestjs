import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Manager } from '../../auth/schemas/manager.schema';

export type HistoryDocument = HydratedDocument<History>;

@Schema({ timestamps: true })
export class History {
    @Prop({ type: Types.ObjectId, ref: User.name, required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: Manager.name, required: true })
    managerId: Types.ObjectId;

    @Prop({ required: true })
    content: string;

    createdAt: Date;
    updatedAt: Date;
}

export const HistorySchema = SchemaFactory.createForClass(History);
