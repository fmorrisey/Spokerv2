import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user.model';
import { RefreshToken } from '../models/refresh-token.model';
import { RegisterRequest, LoginRequest, AuthResponse, UserType } from '../types/user.type';
import { JWT_SECRET, JWT_EXPIRATION, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRATION, OWNER_EMAILS } from '../models/constants';
import { conflict, unauthorized } from './error.service';

// Dummy hash used for timing-safe rejection when user is not found
const DUMMY_HASH = '$2b$12$invalidhashfortimingprotectiononly000000000000000000000';

type Role = UserType['role'];

/**
 * Resolve the effective role for an email against the OWNER_EMAILS allowlist.
 * The allowlist only ever *promotes* to `owner` — it never demotes, so a
 * seeded owner (not necessarily in the allowlist) keeps its role.
 */
export function resolveRole(email: string, currentRole: Role = 'customer'): Role {
  if (OWNER_EMAILS.includes(email.toLowerCase())) return 'owner';
  return currentRole;
}

/** Reconcile a user's stored role with the allowlist, persisting any promotion. */
async function reconcileRole(user: IUser): Promise<Role> {
  const effectiveRole = resolveRole(user.email, user.role);
  if (effectiveRole !== user.role) {
    user.role = effectiveRole;
    await user.save();
  }
  return effectiveRole;
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

async function storeRefreshToken(token: string, userId: string): Promise<void> {
  // Parse expiration from JWT_REFRESH_EXPIRATION (e.g. '7d') to compute expiresAt
  const decoded = jwt.decode(token) as { exp?: number } | null;
  const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({ token, userId, expiresAt });
}

export async function register(data: RegisterRequest): Promise<{ authResponse: AuthResponse; refreshToken: string }> {
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    throw conflict('Email already in use');
  }

  const user = new User({
    email: data.email,
    password: data.password,
    name: data.name,
    role: resolveRole(data.email),
  });
  await user.save();

  const { accessToken, refreshToken } = generateTokens((user._id as any).toString(), user.role);
  await storeRefreshToken(refreshToken, (user._id as any).toString());
  return {
    authResponse: { accessToken, user: toSafeUser(user) },
    refreshToken,
  };
}

export async function login(data: LoginRequest): Promise<{ authResponse: AuthResponse; refreshToken: string }> {
  const user = await User.findOne({ email: data.email.toLowerCase() });

  // Always run bcrypt.compare to prevent timing attacks that reveal valid emails
  const passwordMatch = await bcrypt.compare(data.password, user?.password ?? DUMMY_HASH);
  if (!user || !passwordMatch) {
    throw unauthorized('Invalid credentials');
  }

  const role = await reconcileRole(user);
  const { accessToken, refreshToken } = generateTokens((user._id as any).toString(), role);
  await storeRefreshToken(refreshToken, (user._id as any).toString());
  return {
    authResponse: { accessToken, user: toSafeUser(user) },
    refreshToken,
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
  let payload: { userId: string };
  try {
    payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
  } catch {
    throw unauthorized('Invalid or expired refresh token');
  }

  const stored = await RefreshToken.findOne({ token: refreshToken });
  if (!stored) {
    throw unauthorized('Refresh token not recognized');
  }

  const user = await User.findById(payload.userId);
  if (!user) {
    throw unauthorized('User not found');
  }

  const role = await reconcileRole(user);
  const accessToken = jwt.sign({ userId: payload.userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRATION } as jwt.SignOptions);
  return { accessToken, user: toSafeUser(user) };
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await RefreshToken.deleteOne({ token });
}
