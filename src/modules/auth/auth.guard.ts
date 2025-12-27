import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import mongoose, { Model } from 'mongoose';
import { ApiConfigService } from 'src/modules/api-config/api-config.service';
import { User } from '../user/schemas/user.schema';
import { IUser } from '../user/interfaces/user.interface';

declare global {
  namespace Express {
    interface Request {
      user: IUser;
    }
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private apiConfigService: ApiConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No tokens found.');
    }

    const secret = this.apiConfigService.getJwtSecret;

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret,
      });

      const user = <IUser>(
        (await this.userModel.findOne({ _id: payload.sub })).toObject()
      );
      
      request['user'] = user;
    } catch (error) {
  throw new UnauthorizedException(
      error?.name === 'TokenExpiredError'
        ? 'Token has expired.'
        : 'Invalid authentication token.'
    );
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
