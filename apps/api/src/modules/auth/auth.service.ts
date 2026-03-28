import {
  Inject,
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { UserResponseDto } from './dto/auth-response.dto.js';
import type { JwtPayload } from '../../common/decorators/current-user.decorator.js';
import type { User } from '@prisma/client';
import type { JwtSignOptions } from '@nestjs/jwt';
import type { IUsersRepository } from './repositories/users.repository.js';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USERS_REPOSITORY')
    private readonly usersRepo: IUsersRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserResponseDto;
  }> {
    const existing = await this.usersRepo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email já está em uso');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersRepo.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
    });

    const tokens = await this.generateTokens(user);
    return { ...tokens, user: this.toUserResponse(user) };
  }

  async login(dto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserResponseDto;
  }> {
    const user = await this.usersRepo.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const tokens = await this.generateTokens(user);
    return { ...tokens, user: this.toUserResponse(user) };
  }

  async refresh(
    refreshToken?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.getJwtSecret('jwt.refreshSecret', 'refresh-secret'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const user = await this.usersRepo.findById(payload.sub);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const tokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!tokenValid) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    return this.generateTokens(user);
  }

  async logout(userId: string): Promise<void> {
    await this.usersRepo.updateRefreshToken(userId, null);
  }

  async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.usersRepo.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    return this.toUserResponse(user);
  }

  private async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.getJwtSecret('jwt.accessSecret', 'access-secret'),
      expiresIn: this.getJwtExpiresIn('jwt.accessExpiration', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.getJwtSecret('jwt.refreshSecret', 'refresh-secret'),
      expiresIn: this.getJwtExpiresIn('jwt.refreshExpiration', '7d'),
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.usersRepo.updateRefreshToken(user.id, refreshTokenHash);

    return { accessToken, refreshToken };
  }

  private toUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private getJwtSecret(configKey: string, fallback: string): string {
    return this.configService.get<string>(configKey) ?? fallback;
  }

  private getJwtExpiresIn(
    configKey: string,
    fallback: string,
  ): JwtSignOptions['expiresIn'] {
    return (this.configService.get<string>(configKey) ??
      fallback) as JwtSignOptions['expiresIn'];
  }
}
