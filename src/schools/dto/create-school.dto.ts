import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSchoolDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
