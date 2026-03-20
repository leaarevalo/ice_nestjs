import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { School, SchoolSchema } from './schemas/school.schema';
import { SchoolController } from './school.controller';
import { SchoolService } from './school.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: School.name, schema: SchoolSchema }]),
    AuthModule,
  ],
  controllers: [SchoolController],
  providers: [SchoolService],
  exports: [SchoolService],
})
export class SchoolModule {}
