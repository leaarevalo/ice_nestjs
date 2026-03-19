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
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/schemas/user.schema';

@UseGuards(AuthGuard, RolesGuard)
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @Roles(Role.MANAGER)
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupService.create(createGroupDto);
  }

  @Get()
  @Roles(Role.MANAGER, Role.LIDER, Role.USER)
  findAll(@Request() req: any) {
    return this.groupService.findAll(req.user);
  }

  @Get(':id')
  @Roles(Role.MANAGER, Role.LIDER, Role.USER)
  findById(@Param('id') id: string, @Request() req: any) {
    return this.groupService.findById(id, req.user);
  }

  @Put(':id')
  @Roles(Role.MANAGER, Role.LIDER)
  update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @Request() req: any,
  ) {
    return this.groupService.update(id, updateGroupDto, req.user);
  }

  @Delete(':id')
  @Roles(Role.MANAGER)
  delete(@Param('id') id: string) {
    return this.groupService.delete(id);
  }
}
