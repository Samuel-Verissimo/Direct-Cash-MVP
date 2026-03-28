import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
  genSalt: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require('bcrypt') as { hash: jest.Mock; compare: jest.Mock };

const mockConfigService = {
  get: (key: string): string => {
    const map: Record<string, string> = {
      'jwt.accessSecret': 'test-access-secret',
      'jwt.refreshSecret': 'test-refresh-secret',
      'jwt.accessExpiration': '15m',
      'jwt.refreshExpiration': '7d',
    };
    return map[key] ?? '';
  },
};

const baseUser = {
  id: 'user-1',
  email: 'user@test.com',
  name: 'Test User',
  passwordHash: 'hashed_pw',
  role: 'USER' as const,
  refreshToken: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function createMockUsersRepository() {
  return {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateRefreshToken: jest.fn(),
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let usersRepo: ReturnType<typeof createMockUsersRepository>;

  beforeEach(async () => {
    usersRepo = createMockUsersRepository();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-access-secret',
          signOptions: { expiresIn: '15m' },
        }),
      ],
      providers: [
        AuthService,
        { provide: 'USERS_REPOSITORY', useValue: usersRepo },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('throws ConflictException when email already exists', async () => {
      usersRepo.findByEmail.mockResolvedValue(baseUser);

      await expect(
        service.register({
          email: baseUser.email,
          name: 'Test',
          password: 'pass123',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('returns tokens and user on success', async () => {
      usersRepo.findByEmail.mockResolvedValue(null);
      usersRepo.create.mockResolvedValue(baseUser);
      usersRepo.updateRefreshToken.mockResolvedValue(undefined);
      bcrypt.hash.mockResolvedValue('hashed_refresh');

      const result = await service.register({
        email: 'new@test.com',
        name: 'New User',
        password: 'password123',
      });

      expect(usersRepo.create).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(baseUser.email);
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException when user is not found', async () => {
      usersRepo.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'ghost@test.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when password is wrong', async () => {
      usersRepo.findByEmail.mockResolvedValue(baseUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        service.login({ email: baseUser.email, password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns tokens on valid credentials', async () => {
      usersRepo.findByEmail.mockResolvedValue(baseUser);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('hashed_refresh');
      usersRepo.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.login({
        email: baseUser.email,
        password: 'correct',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.id).toBe(baseUser.id);
    });
  });

  describe('refresh', () => {
    it('throws UnauthorizedException when token is undefined', async () => {
      await expect(service.refresh(undefined)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when token is invalid JWT', async () => {
      await expect(service.refresh('not-a-valid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('clears the stored refresh token', async () => {
      usersRepo.updateRefreshToken.mockResolvedValue(undefined);

      await service.logout(baseUser.id);

      expect(usersRepo.updateRefreshToken).toHaveBeenCalledWith(
        baseUser.id,
        null,
      );
    });
  });

  describe('getMe', () => {
    it('throws UnauthorizedException when user does not exist', async () => {
      usersRepo.findById.mockResolvedValue(null);

      await expect(service.getMe('nonexistent')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('returns formatted user when found', async () => {
      usersRepo.findById.mockResolvedValue(baseUser);

      const result = await service.getMe(baseUser.id);

      expect(result.id).toBe(baseUser.id);
      expect(result.email).toBe(baseUser.email);
    });
  });
});
