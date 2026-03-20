import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Submission, SubmissionSchema } from './schemas/submission.schema';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';
import { AuthModule } from '../auth/auth.module';
import { AcademicModuleModule } from '../academic-modules/academic-module.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Submission.name, schema: SubmissionSchema },
    ]),
    AuthModule,
    AcademicModuleModule,
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService],
  exports: [SubmissionService],
})
export class SubmissionModule {}
