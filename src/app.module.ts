import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { GroupModule } from './groups/group.module';
import { HistoryModule } from './history/history.module';
import { SmallGroupModule } from './small-groups/small-group.module';
import { SchoolModule } from './schools/school.module';
import { AcademicModuleModule } from './academic-modules/academic-module.module';
import { EnrollmentModule } from './enrollments/enrollment.module';
import { SubmissionModule } from './submissions/submission.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    AuthModule,
    GroupModule,
    HistoryModule,
    SmallGroupModule,
    SchoolModule,
    AcademicModuleModule,
    EnrollmentModule,
    SubmissionModule,
    MongooseModule.forRoot(process.env.MONGO_URI),
  ],
})
export class AppModule {}
