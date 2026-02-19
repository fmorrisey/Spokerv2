import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';

import productRoutes from './routes/product.route';
import authRoutes from './routes/auth.route';
import configRoutes from './routes/config.route';

import { errorHandler } from './middleware/errorHandler';
import { healthCheck } from './middleware/healthCheck';
import { sanitizeBody } from './middleware/sanitize';

import { setupSwagger } from './config/swagger';
import { connectDB } from './config/mongodb';
import { API_URL, Routes } from './models/constants';

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration - more restrictive in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? (() => {
        if (!process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGINS.trim() === '') {
          throw new Error('ALLOWED_ORIGINS must be configured in production');
        }
        return process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
      })()
    : true, // Allow all origins in development
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());
app.use(sanitizeBody);
app.use(cors(corsOptions));

// Configure Helmet with CSP exceptions for Swagger UI
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// Swagger Docs
if (process.env.NODE_ENV !== 'production') {setupSwagger(app)};

// Routes
app.use(API_URL + Routes.HEALTH, healthCheck);
app.use(API_URL + Routes.CONFIG, configRoutes);
app.use(API_URL + Routes.AUTH, authRoutes);
app.use(API_URL + Routes.PRODUCTS, productRoutes);
app.use(errorHandler);

// Database Connection
connectDB();

export default app;