import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import productRoutes from './routes/product.route';
import { errorHandler } from './middleware/errorHandler';
import { healthCheck } from './middleware/healthCheck';

import { setupSwagger } from './config/swagger';
import { connectDB } from './config/mongodb';

const BASE_URL = process.env.API_BASE_URL || '/api/v1';

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
app.use(`${BASE_URL}/health`, healthCheck);
app.use(`${BASE_URL}/products`, productRoutes);
app.use(errorHandler);

// Database Connection
connectDB();

export default app;
