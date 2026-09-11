import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { config } from './config/env';
import authRoutes from './modules/auth/authRoutes';
import customerRoutes from './modules/customer/customerRoutes';
import productRoutes from './modules/product/productRoutes';
import challanRoutes from './modules/challan/challanRoutes';
import userRoutes from './modules/user/userRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve built frontend on the same host/port (single-host deployment)
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
const hasFrontend = fs.existsSync(path.join(frontendDist, 'index.html'));
if (hasFrontend) {
  app.use(express.static(frontendDist));
}

// Root
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    name: 'FundsRoom ERP/CRM API',
    message: 'API is running. See /api/health for endpoints.',
    health: '/api/health',
  });
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'FundsRoom ERP/CRM API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      customers: '/api/customers',
      products: '/api/products',
      challans: '/api/challans',
      users: '/api/users',
    },
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/challans', challanRoutes);
app.use('/api/users', userRoutes);

// SPA fallback (must come after API routes)
if (hasFrontend) {
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
});

// Global error handler
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`🚀 FundsRoom API running on http://localhost:${config.port}`);
  console.log(`   Environment: ${config.nodeEnv}`);
});

export default app;