import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AcademicModule,
  AcademicModuleSchema,
} from './schemas/academic-module.schema';
import {
  Enrollment,
  EnrollmentSchema,
} from '../enrollments/schemas/enrollment.schema';
import { AcademicModuleController } from './academic-module.controller';
import { AcademicModuleService } from './academic-module.service';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../users/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AcademicModule.name, schema: AcademicModuleSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
    ]),
    AuthModule,
    forwardRef(() => UserModule),
  ],
  controllers: [AcademicModuleController],
  providers: [AcademicModuleService],
  exports: [AcademicModuleService, MongooseModule],
})
export class AcademicModuleModule {}
