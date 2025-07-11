import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import { registerRoutes } from '../../server/routes.js';

const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Register all routes
registerRoutes(app);

export const handler = serverless(app);