import { IsString, IsOptional } from 'class-validator';

export class UpdateHistoryDto {
    @IsString()
    @IsOptional()
    content?: string;
}
