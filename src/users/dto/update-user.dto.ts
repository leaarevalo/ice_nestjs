import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './user.controller.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) { }
