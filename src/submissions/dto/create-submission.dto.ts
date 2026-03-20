import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class CreateSubmissionDto {
  @IsMongoId()
  @IsNotEmpty()
  academicModule: string;

  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @IsString()
  @IsNotEmpty()
  fileName: string;
}
