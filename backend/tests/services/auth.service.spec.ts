import { jest } from '@jest/globals';
import * as AuthService from '../../src/services/auth.service';
import { User } from '../../src/models/user.model';
import { RefreshToken } from '../../src/models/refresh-token.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const mockUserDoc = {
  _id: { toString: () => 'user1' },
  email: 'test@test.com',
  name: 'Test User',
  role: 'customer',
  password: 'hashed-password',
  save: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
};

const mockRefreshTokenDoc = { token: 'mock-token', userId: 'user1' };

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(jwt, 'sign').mockReturnValue('mock-token' as any);
    jest.spyOn(jwt, 'decode').mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 604800 } as any);
    jest.spyOn(RefreshToken, 'create').mockResolvedValue(mockRefreshTokenDoc as any);
    jest.spyOn(RefreshToken, 'deleteOne').mockResolvedValue({ deletedCount: 1 } as any);
  });

  describe('register', () => {
    it('should create a user and return tokens', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null as any);
      jest.spyOn(User.prototype, 'save').mockResolvedValue(mockUserDoc as any);

      const result = await AuthService.register({ email: 'test@test.com', password: 'password123', name: 'Test User' });

      expect(result.authResponse.accessToken).toBe('mock-token');
      expect(result.authResponse.user).not.toHaveProperty('password');
      expect(result.refreshToken).toBe('mock-token');
    });

    it('should throw 409 if email already exists', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUserDoc as any);

      await expect(
        AuthService.register({ email: 'test@test.com', password: 'password123', name: 'Test' })
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  describe('login', () => {
    it('should return tokens on correct credentials', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUserDoc as any);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await AuthService.login({ email: 'test@test.com', password: 'password123' });

      expect(result.authResponse.accessToken).toBe('mock-token');
      expect(result.authResponse.user.email).toBe('test@test.com');
      expect(result.authResponse.user).not.toHaveProperty('password');
    });

    it('should throw 401 if user not found', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null as any);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(
        AuthService.login({ email: 'nobody@test.com', password: 'pass' })
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('should throw 401 on bad password', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUserDoc as any);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(
        AuthService.login({ email: 'test@test.com', password: 'wrongpass' })
      ).rejects.toMatchObject({ statusCode: 401 });
    });
  });

  describe('refreshAccessToken', () => {
    it('should return new access token for valid refresh token', async () => {
      jest.spyOn(jwt, 'verify').mockReturnValue({ userId: 'user1' } as any);
      jest.spyOn(RefreshToken, 'findOne').mockResolvedValue(mockRefreshTokenDoc as any);
      jest.spyOn(User, 'findById').mockResolvedValue(mockUserDoc as any);

      const result = await AuthService.refreshAccessToken('valid-refresh-token');

      expect(result.accessToken).toBe('mock-token');
    });

    it('should throw 401 for invalid refresh token', async () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => { throw new Error('invalid'); });

      await expect(
        AuthService.refreshAccessToken('bad-token')
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('should throw 401 if token not in DB', async () => {
      jest.spyOn(jwt, 'verify').mockReturnValue({ userId: 'user1' } as any);
      jest.spyOn(RefreshToken, 'findOne').mockResolvedValue(null as any);

      await expect(
        AuthService.refreshAccessToken('unrecognized-token')
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('should throw 401 if user no longer exists', async () => {
      jest.spyOn(jwt, 'verify').mockReturnValue({ userId: 'user1' } as any);
      jest.spyOn(RefreshToken, 'findOne').mockResolvedValue(mockRefreshTokenDoc as any);
      jest.spyOn(User, 'findById').mockResolvedValue(null as any);

      await expect(
        AuthService.refreshAccessToken('valid-refresh-token')
      ).rejects.toMatchObject({ statusCode: 401 });
    });
  });

  describe('revokeRefreshToken', () => {
    it('should call RefreshToken.deleteOne', async () => {
      const spy = jest.spyOn(RefreshToken, 'deleteOne').mockResolvedValue({ deletedCount: 1 } as any);
      await AuthService.revokeRefreshToken('some-token');
      expect(spy).toHaveBeenCalledWith({ token: 'some-token' });
    });
  });

  describe('toSafeUser', () => {
    it('should exclude password from user object', () => {
      const safeUser = AuthService.toSafeUser(mockUserDoc as any);
      expect(safeUser).not.toHaveProperty('password');
      expect(safeUser.email).toBe('test@test.com');
    });
  });

  describe('generateTokens', () => {
    it('should return accessToken and refreshToken', () => {
      const tokens = AuthService.generateTokens('user1', 'customer');
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
    });
  });
});
