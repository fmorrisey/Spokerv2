import { RequestHandler } from 'express';
import * as AuthService from '../services/auth.service';
import { User } from '../models/user.model';

const REFRESH_COOKIE = 'refresh_token';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function badRequestError(message: string): Error {
  return Object.assign(new Error(message), { statusCode: 400 });
}

export const register: RequestHandler = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email) return next(badRequestError('Email is required'));
    if (!password || password.length < 8) return next(badRequestError('Password must be at least 8 characters'));
    if (!name) return next(badRequestError('Name is required'));

    const { authResponse, refreshToken } = await AuthService.register({ email, password, name });
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
    res.status(201).json(authResponse);
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return next(badRequestError('Email and password are required'));

    const { authResponse, refreshToken } = await AuthService.login({ email, password });
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
    res.status(200).json(authResponse);
  } catch (error) {
    next(error);
  }
};

export const refresh: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) return next(Object.assign(new Error('No refresh token'), { statusCode: 401 }));

    const result = await AuthService.refreshAccessToken(token);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = (_req, res) => {
  res.clearCookie(REFRESH_COOKIE, { httpOnly: true, sameSite: 'strict' });
  res.status(204).send();
};

export const me: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as any).user?.userId;
    const user = await User.findById(userId);
    if (!user) return next(Object.assign(new Error('User not found'), { statusCode: 404 }));
    res.status(200).json(AuthService.toSafeUser(user));
  } catch (error) {
    next(error);
  }
};
