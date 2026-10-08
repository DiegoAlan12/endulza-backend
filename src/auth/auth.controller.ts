import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registrar')
  registrar(@Body() body: any) {
    return this.authService.registrar(body);
  }

  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body);
  }
}