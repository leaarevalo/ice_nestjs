import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from './schemas/group.schema';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../users/user.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }]),
        forwardRef(() => AuthModule),
        forwardRef(() => UserModule),
    ],
    controllers: [GroupController],
    providers: [GroupService],
    exports: [GroupService],
})
export class GroupModule { }
