import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.signIn(loginDto.username, loginDto.password);
  }

  @Post('/register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(AuthGuard)
  @Get('/managers')
  getManagers() {
    return this.authService.getManagers();
  }

  @UseGuards(AuthGuard)
  @Get('/managers/:id')
  getManagerById(@Param('id') id: string) {
    return this.authService.getManagerById(id);
  }

  @UseGuards(AuthGuard)
  @Put('/managers/:id')
  updateManager(
    @Param('id') id: string,
    @Body() updateDto: UpdateManagerDto,
  ) {
    return this.authService.updateManager(id, updateDto);
  }

  @UseGuards(AuthGuard)
  @Delete('/managers/:id')
  deleteManager(@Param('id') id: string) {
    return this.authService.deleteManager(id);
  }
}
