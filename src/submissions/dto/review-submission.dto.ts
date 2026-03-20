import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SubmissionStatus } from '../schemas/submission.schema';

export class ReviewSubmissionDto {
  @IsEnum(SubmissionStatus)
  @IsNotEmpty()
  status: SubmissionStatus;

  @IsString()
  @IsOptional()
  feedback?: string;
}
