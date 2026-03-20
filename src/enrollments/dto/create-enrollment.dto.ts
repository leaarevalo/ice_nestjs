import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class CreateEnrollmentDto {
  @IsString()
  @IsNotEmpty()
  studentDocument: string;

  @IsMongoId()
  @IsNotEmpty()
  school: string;
}
