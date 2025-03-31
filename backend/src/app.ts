import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import itemRoutes from './routes/item.route';
import { errorHandler } from './middleware/errorHandler';
import { healthCheck } from './middleware/healthCheck';

import { connectDB } from './config/mongodb';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
app.use('/api/v1/health', healthCheck);
app.use('/api/v1/items', itemRoutes);
app.use(errorHandler);

// Database Connection
connectDB();

export default app;
