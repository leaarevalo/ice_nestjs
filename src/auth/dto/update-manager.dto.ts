import { IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { Role } from '../schemas/manager.schema';

export class UpdateManagerDto {
    @IsString()
    @IsOptional()
    username?: string;

    @IsString()
    @MinLength(6)
    @IsOptional()
    password?: string;

    @IsEnum(Role)
    @IsOptional()
    role?: Role;
}
