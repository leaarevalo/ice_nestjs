import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateHistoryDto {
    @IsMongoId()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    content: string;
}
