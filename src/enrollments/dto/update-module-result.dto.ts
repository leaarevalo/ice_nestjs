import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';
import { ModuleResultStatus } from '../schemas/enrollment.schema';

export class UpdateModuleResultDto {
  @IsMongoId()
  @IsNotEmpty()
  academicModule: string;

  @IsEnum(ModuleResultStatus)
  @IsNotEmpty()
  status: ModuleResultStatus;
}
