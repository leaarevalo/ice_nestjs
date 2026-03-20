import { PartialType } from '@nestjs/mapped-types';
import { CreateAcademicModuleDto } from './create-academic-module.dto';

export class UpdateAcademicModuleDto extends PartialType(
  CreateAcademicModuleDto,
) {}
