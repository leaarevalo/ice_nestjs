/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  document: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  email: string;

  @IsString()
  dateOfBirth: string;

  @IsString()
  history: string;

  @IsString()
  dateOfConversion: string;
}
