import type { User } from '@prisma/client';

export interface IUsersRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: {
    email: string;
    name: string;
    passwordHash: string;
  }): Promise<User>;
  updateRefreshToken(id: string, hash: string | null): Promise<void>;
}
