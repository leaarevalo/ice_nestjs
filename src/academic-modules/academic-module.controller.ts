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
import { AcademicModuleService } from './academic-module.service';
import { CreateAcademicModuleDto } from './dto/create-academic-module.dto';
import { UpdateAcademicModuleDto } from './dto/update-academic-module.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/schemas/user.schema';

@UseGuards(AuthGuard, RolesGuard)
@Controller('academic-modules')
export class AcademicModuleController {
  constructor(private readonly academicModuleService: AcademicModuleService) {}

  @Post()
  @Roles(Role.MANAGER)
  create(@Body() dto: CreateAcademicModuleDto) {
    return this.academicModuleService.create(dto);
  }

  @Get()
  @Roles(Role.MANAGER, Role.LIDER, Role.COUNSELOR, Role.USER)
  findAll(@Request() req: any) {
    return this.academicModuleService.findAll(req.user);
  }

  @Get('school/:schoolId')
  @Roles(Role.MANAGER, Role.LIDER, Role.COUNSELOR, Role.USER)
  findBySchool(@Param('schoolId') schoolId: string, @Request() req: any) {
    return this.academicModuleService.findBySchool(schoolId, req.user);
  }

  @Get(':id')
  @Roles(Role.MANAGER, Role.LIDER, Role.COUNSELOR, Role.USER)
  findById(@Param('id') id: string, @Request() req: any) {
    return this.academicModuleService.findById(id, req.user);
  }

  @Put(':id')
  @Roles(Role.MANAGER, Role.LIDER, Role.COUNSELOR, Role.USER)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAcademicModuleDto,
    @Request() req: any,
  ) {
    return this.academicModuleService.update(id, dto, req.user);
  }

  @Delete(':id')
  @Roles(Role.MANAGER)
  delete(@Param('id') id: string) {
    return this.academicModuleService.delete(id);
  }
}
