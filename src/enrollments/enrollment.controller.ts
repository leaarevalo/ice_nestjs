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
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateModuleResultDto } from './dto/update-module-result.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/schemas/user.schema';

@UseGuards(AuthGuard, RolesGuard)
@Controller('enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  @Roles(Role.MANAGER, Role.LIDER, Role.COUNSELOR, Role.USER)
  create(@Body() dto: CreateEnrollmentDto, @Request() req: any) {
    return this.enrollmentService.create(dto, req.user);
  }

  @Get()
  @Roles(Role.MANAGER)
  findAll() {
    return this.enrollmentService.findAll();
  }

  @Get('my')
  @Roles(Role.MANAGER, Role.LIDER, Role.COUNSELOR, Role.USER)
  findMyEnrollments(@Request() req: any) {
    return this.enrollmentService.findMyEnrollments(req.user.sub);
  }

  @Get('school/:schoolId')
  @Roles(Role.MANAGER, Role.LIDER, Role.COUNSELOR, Role.USER)
  findBySchool(@Param('schoolId') schoolId: string) {
    return this.enrollmentService.findBySchool(schoolId);
  }

  @Get(':id')
  @Roles(Role.MANAGER, Role.LIDER, Role.COUNSELOR, Role.USER)
  findById(@Param('id') id: string) {
    return this.enrollmentService.findById(id);
  }

  @Put(':id/module-result')
  @Roles(Role.MANAGER, Role.LIDER, Role.COUNSELOR, Role.USER)
  updateModuleResult(
    @Param('id') id: string,
    @Body() dto: UpdateModuleResultDto,
    @Request() req: any,
  ) {
    return this.enrollmentService.updateModuleResult(id, dto, req.user);
  }

  @Delete(':id')
  @Roles(Role.MANAGER, Role.LIDER, Role.COUNSELOR, Role.USER)
  delete(@Param('id') id: string, @Request() req: any) {
    return this.enrollmentService.delete(id, req.user);
  }
}
