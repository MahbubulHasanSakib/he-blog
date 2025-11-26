import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserSignInDto } from './dto/create-user-signin.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { User } from '../user/user.decorator';
import { IUser } from '../user/interfaces/user.interface';
import { AuthGuard } from './auth.guard';
import { ResponseInterceptor } from 'src/utils/response.interceptor';
@ApiTags('auth')
@UseInterceptors(ResponseInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  userSignIn(@Body() createUserSignInDto: CreateUserSignInDto) {
    return this.authService.userSignIn(createUserSignInDto);
  }

  @ApiBearerAuth()
  @Post('signout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  userSignOut(@User() user: IUser) {
    return this.authService.userSignOut(user);
  }
}
