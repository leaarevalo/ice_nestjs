import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsMongoId,
  IsNumber,
} from 'class-validator';

export class CreateAcademicModuleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsMongoId()
  @IsNotEmpty()
  school: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  professors?: string[];

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  materialLinks?: string[];
}
