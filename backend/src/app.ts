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
app.use(helmet());

// TDOO: Set security headers

// Swagger Docs
setupSwagger(app);

// Routes
app.use(API_URL + Routes.HEALTH, healthCheck);
app.use(API_URL + Routes.PRODUCTS, productRoutes);
app.use(errorHandler);

// Database Connection
connectDB();

export default app;
