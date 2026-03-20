import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from './schemas/user.schema';
import { Group, GroupSchema } from '../groups/schemas/group.schema';
import {
  Enrollment,
  EnrollmentSchema,
} from '../enrollments/schemas/enrollment.schema';
import {
  AcademicModule,
  AcademicModuleSchema,
} from '../academic-modules/schemas/academic-module.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Group.name, schema: GroupSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: AcademicModule.name, schema: AcademicModuleSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
