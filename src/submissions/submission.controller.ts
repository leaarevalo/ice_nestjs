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
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { ReviewSubmissionDto } from './dto/review-submission.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/schemas/user.schema';

@UseGuards(AuthGuard, RolesGuard)
@Controller('submissions')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  @Roles(Role.MANAGER, Role.LIDER, Role.COUNSELOR, Role.USER)
  create(@Body() dto: CreateSubmissionDto, @Request() req: any) {
    return this.submissionService.create(dto, req.user.sub);
  }

  @Get('my')
  @Roles(Role.MANAGER, Role.LIDER, Role.COUNSELOR, Role.USER)
  findMySubmissions(@Request() req: any) {
    return this.submissionService.findMySubmissions(req.user.sub);
  }

  @Get('module/:moduleId')
  @Roles(Role.MANAGER, Role.LIDER, Role.COUNSELOR, Role.USER)
  findByModule(@Param('moduleId') moduleId: string, @Request() req: any) {
    return this.submissionService.findByModule(moduleId, req.user);
  }

  @Get(':id')
  @Roles(Role.MANAGER, Role.LIDER, Role.COUNSELOR, Role.USER)
  findById(@Param('id') id: string) {
    return this.submissionService.findById(id);
  }

  @Put(':id/review')
  @Roles(Role.MANAGER, Role.LIDER, Role.COUNSELOR, Role.USER)
  review(
    @Param('id') id: string,
    @Body() dto: ReviewSubmissionDto,
    @Request() req: any,
  ) {
    return this.submissionService.review(id, dto, req.user);
  }

  @Delete(':id')
  @Roles(Role.MANAGER)
  delete(@Param('id') id: string) {
    return this.submissionService.delete(id);
  }
}
