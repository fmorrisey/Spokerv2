import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user.model';
import { RegisterRequest, LoginRequest, AuthResponse, UserType } from '../types/user.type';
import { JWT_SECRET, JWT_EXPIRATION, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRATION } from '../models/constants';

function makeError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

export function toSafeUser(user: IUser): UserType {
  return {
    _id: (user._id as any).toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export function generateTokens(userId: string, role: string): { accessToken: string; refreshToken: string } {
  const accessToken = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRATION } as jwt.SignOptions);
  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRATION } as jwt.SignOptions);
  return { accessToken, refreshToken };
}

export async function register(data: RegisterRequest): Promise<{ authResponse: AuthResponse; refreshToken: string }> {
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    throw makeError('Email already in use', 409);
  }

  const user = new User({ email: data.email, password: data.password, name: data.name });
  await user.save();

  const { accessToken, refreshToken } = generateTokens((user._id as any).toString(), user.role);
  return {
    authResponse: { accessToken, user: toSafeUser(user) },
    refreshToken,
  };
}

export async function login(data: LoginRequest): Promise<{ authResponse: AuthResponse; refreshToken: string }> {
  const user = await User.findOne({ email: data.email.toLowerCase() });
  if (!user) {
    throw makeError('Invalid credentials', 401);
  }

  const passwordMatch = await bcrypt.compare(data.password, user.password);
  if (!passwordMatch) {
    throw makeError('Invalid credentials', 401);
  }

  const { accessToken, refreshToken } = generateTokens((user._id as any).toString(), user.role);
  return {
    authResponse: { accessToken, user: toSafeUser(user) },
    refreshToken,
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
  let payload: { userId: string };
  try {
    payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
  } catch {
    throw makeError('Invalid or expired refresh token', 401);
  }

  const user = await User.findById(payload.userId);
  if (!user) {
    throw makeError('User not found', 401);
  }

  const accessToken = jwt.sign({ userId: payload.userId, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRATION } as jwt.SignOptions);
  return { accessToken };
}
