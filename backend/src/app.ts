import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import productRoutes from './routes/product.route';
import { errorHandler } from './middleware/errorHandler';
import { healthCheck } from './middleware/healthCheck';

import { setupSwagger } from './config/swagger';
import { connectDB } from './config/mongodb';
import { API_URL, Routes } from './models/constants';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

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
app.use(API_URL + Routes.PRODUCTS, productRoutes);
app.use(errorHandler);

// Database Connection
connectDB();

export default app;