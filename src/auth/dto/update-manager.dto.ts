import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Role } from '../schemas/manager.schema';

export class UpdateManagerDto {
    @IsString()
    @IsOptional()
    username?: string;

    @IsEnum(Role)
    @IsOptional()
    role?: Role;
}
