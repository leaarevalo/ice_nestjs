import {
  Body,
  Controller,
  Get,
  Post,
  ValidationPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/user.controller.dto';
import { AuthGuard } from '../auth/auth.guard';

interface JwtPayload {
  user: {
    sub: string;
    email: string;
    role: string;
  };
}

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get()
  getUsers(@Request() req: Partial<JwtPayload>): Promise<any> {
    return this.userService.getUsers(req.user?.role);
  }

  @UseGuards(AuthGuard)
  @Post()
  createUser(
    @Body(ValidationPipe) user: CreateUserDto,
  ): Promise<CreateUserDto[]> {
    return this.userService.createUpdateUser(user);
  }
}
