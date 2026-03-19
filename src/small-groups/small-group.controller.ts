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
import { SmallGroupService } from './small-group.service';
import { CreateSmallGroupDto } from './dto/create-small-group.dto';
import { UpdateSmallGroupDto } from './dto/update-small-group.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/schemas/user.schema';

@UseGuards(AuthGuard, RolesGuard)
@Controller('small-groups')
export class SmallGroupController {
  constructor(private readonly smallGroupService: SmallGroupService) {}

  @Post()
  @Roles(Role.MANAGER, Role.LIDER)
  create(
    @Body() createSmallGroupDto: CreateSmallGroupDto,
    @Request() req: any,
  ) {
    return this.smallGroupService.create(createSmallGroupDto, req.user);
  }

  @Get()
  @Roles(Role.MANAGER, Role.LIDER, Role.USER)
  findAll(@Request() req: any) {
    return this.smallGroupService.findAll(req.user);
  }

  @Get('group/:groupId')
  @Roles(Role.MANAGER, Role.LIDER, Role.USER)
  findByGroup(@Param('groupId') groupId: string, @Request() req: any) {
    return this.smallGroupService.findByGroup(groupId, req.user);
  }

  @Get(':id')
  @Roles(Role.MANAGER, Role.LIDER, Role.USER)
  findById(@Param('id') id: string, @Request() req: any) {
    return this.smallGroupService.findById(id, req.user);
  }

  @Put(':id')
  @Roles(Role.MANAGER, Role.LIDER)
  update(
    @Param('id') id: string,
    @Body() updateSmallGroupDto: UpdateSmallGroupDto,
    @Request() req: any,
  ) {
    return this.smallGroupService.update(id, updateSmallGroupDto, req.user);
  }

  @Delete(':id')
  @Roles(Role.MANAGER, Role.LIDER)
  delete(@Param('id') id: string, @Request() req: any) {
    return this.smallGroupService.delete(id, req.user);
  }
}
