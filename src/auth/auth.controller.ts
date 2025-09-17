import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  login(@Body() body: { username: string; password: string }) {
    return this.authService.signIn(body.username, body.password);
  }

  @Post('/register')
  register(
    @Body(ValidationPipe)
    body: {
      username: string;
      password: string;
      role?: string;
    },
  ) {
    return this.authService.register(body.username, body.password, body.role);
  }
}
