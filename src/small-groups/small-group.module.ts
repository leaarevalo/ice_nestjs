import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SmallGroup, SmallGroupSchema } from './schemas/small-group.schema';
import { SmallGroupController } from './small-group.controller';
import { SmallGroupService } from './small-group.service';
import { UserModule } from '../users/user.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: SmallGroup.name, schema: SmallGroupSchema },
        ]),
        UserModule,
    ],
    controllers: [SmallGroupController],
    providers: [SmallGroupService],
    exports: [SmallGroupService],
})
export class SmallGroupModule { }
