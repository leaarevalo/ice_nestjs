import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SchoolService } from './school.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/schemas/user.schema';

@UseGuards(AuthGuard, RolesGuard)
@Controller('schools')
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Post()
  @Roles(Role.MANAGER)
  create(@Body() dto: CreateSchoolDto, @Request() req: any) {
    return this.schoolService.create(dto, req.user.sub);
  }

  @Get()
  @Roles(Role.MANAGER)
  findAll() {
    return this.schoolService.findAll();
  }

  @Get(':id')
  @Roles(Role.MANAGER)
  findById(@Param('id') id: string) {
    return this.schoolService.findById(id);
  }

  @Put(':id')
  @Roles(Role.MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateSchoolDto) {
    return this.schoolService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.MANAGER)
  delete(@Param('id') id: string) {
    return this.schoolService.delete(id);
  }
}
