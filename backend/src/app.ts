import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import routes from './routes/index';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
app.use('/api', routes);

// Database Connection
// mongoose.connect(process.env.MONGO_URI as string, {
// }).then(() => console.log('MongoDB Connected'))
//   .catch(err => console.error('MongoDB Connection Error:', err));

export default app;
