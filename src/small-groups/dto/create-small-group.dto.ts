import { IsString, IsNotEmpty, IsOptional, IsArray, IsMongoId } from 'class-validator';

export class CreateSmallGroupDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsMongoId()
    @IsNotEmpty()
    group: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    leaders?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    participants?: string[];

    @IsString()
    @IsOptional()
    description?: string;
}
