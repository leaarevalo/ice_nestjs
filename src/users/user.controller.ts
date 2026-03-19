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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/user.controller.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from './schemas/user.schema';

@UseGuards(AuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(Role.MANAGER, Role.LIDER, Role.USER, Role.COUNSELOR)
  getUsers(@Request() req: any) {
    return this.userService.getUsers(req.user);
  }

  @Get(':id')
  @Roles(Role.MANAGER, Role.LIDER, Role.USER, Role.COUNSELOR)
  getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Post()
  @Roles(Role.MANAGER)
  createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @Put(':id')
  @Roles(Role.MANAGER)
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(id, dto);
  }

  @Delete(':id')
  @Roles(Role.MANAGER)
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
