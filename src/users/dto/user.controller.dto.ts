import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  document: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  dateOfConversion?: string;

  @IsString()
  @IsOptional()
  civilState?: string;

  @IsString()
  @IsOptional()
  marriageDate?: string;

  @IsString()
  @IsOptional()
  studyStatus?: string;

  @IsString()
  @IsOptional()
  ocupation?: string;

  @IsBoolean()
  @IsOptional()
  hasSocialWork?: boolean;

  @IsNumber()
  @IsOptional()
  numberOfChilds?: number;

  @IsString()
  @IsOptional()
  tutorInfo?: string;
}
