import { IsString, IsNotEmpty, IsOptional, IsArray, IsMongoId } from 'class-validator';

export class CreateGroupDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsArray()
    @IsMongoId({ each: true })
    @IsOptional()
    managers?: string[];

    @IsString()
    @IsOptional()
    description?: string;
}
