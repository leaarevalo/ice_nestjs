import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Enrollment, EnrollmentSchema } from './schemas/enrollment.schema';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../users/user.module';
import { AcademicModuleModule } from '../academic-modules/academic-module.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Enrollment.name, schema: EnrollmentSchema },
    ]),
    AuthModule,
    forwardRef(() => UserModule),
    AcademicModuleModule,
  ],
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
