import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserSignInDto } from './dto/create-user-signin.dto';
import { User } from '../user/schemas/user.schema';
import { ApiConfigService } from 'src/modules/api-config/api-config.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IUser } from '../user/interfaces/user.interface';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,

    private apiConfigService: ApiConfigService,
    private jwtService: JwtService,
  ) {}

  async userSignIn(dto: CreateUserSignInDto) {
    const user: IUser = await this.userModel
      .findOne({
        email: dto.email,
        deletedAt: null,
      })
      .lean();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) {
      throw new ForbiddenException('Email or password is incorrect.');
    }

    const {
      _id: sub,
      password,
      deletedAt,
      createdAt,
      updatedAt,
      ...data
    } = user;

    const access_token = await this.jwtService.signAsync({ sub, ...data });

    // create refresh token (signed with refresh secret & expiry)
    const refresh_token = await this.jwtService.signAsync({ sub }, {
      secret: this.apiConfigService.getJwtRefreshSecret,
      expiresIn: this.apiConfigService.getJwtRefreshExpire,
    });

    // NOTE: refresh tokens are NOT stored in the user collection per request
    // (stateless refresh tokens). The token is returned to the client only.

    return {
      data: {
        access_token,
        refresh_token,
        payload: { id: sub, ...data },
        message: 'Logged in successfully',
      },
    };
  }

  async userSignOut(user: IUser) {
    const found = await this.userModel.findById(user._id);

    if (!found) {
      throw new ForbiddenException('You are not able to log out.');
    }

    return {
      data: null,
      message: 'Logged out successfully',
    };
  }

  async refresh(refresh_token: string) {
    try {
      const payload: any = await this.jwtService.verifyAsync(refresh_token, {
        secret: this.apiConfigService.getJwtRefreshSecret,
      });
      const user: IUser = await this.userModel.findById(payload.sub).lean();

      if (!user) {
        throw new ForbiddenException('Invalid refresh token');
      }

      const {
        _id: sub,
        password,
        deletedAt,
        createdAt,
        updatedAt,
        ...data
      } = user;

      const access_token = await this.jwtService.signAsync({ sub, ...data });

      // issue a new refresh token (rotation) but do NOT persist it server-side
      const new_refresh_token = await this.jwtService.signAsync({ sub }, {
        secret: this.apiConfigService.getJwtRefreshSecret,
        expiresIn: this.apiConfigService.getJwtRefreshExpire,
      });

      return {
        data: {
          access_token,
          refresh_token: new_refresh_token,
          payload: { id: sub, ...data },
          message: 'Token refreshed',
        },
      };
    } catch (error) {
      throw new ForbiddenException('Invalid refresh token');
    }
  }
}
