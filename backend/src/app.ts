import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './infra/config';
import logger from './infra/logger';
import { errorMiddleware } from './common/errors/error.middleware';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';
import { setupSwagger } from './infra/docs/swagger';

// Routes imports
import authRouter from './modules/auth/auth.routes';
import userRouter from './modules/users/user.routes';
import productRouter from './modules/products/product.routes';
import inventoryRouter from './modules/inventory/inventory.routes';
import poRouter from './modules/purchase-orders/purchase-order.routes';
import customerRouter from './modules/customers/customer.routes';
import salesOrderRouter from './modules/sales-orders/sales-order.routes';
import dashboardRouter from './modules/dashboard/dashboard.routes';
import reportsRouter from './modules/reports/reports.routes';
import systemRouter from './modules/system/system.routes';
import supplierRouter from './modules/suppliers/supplier.routes';
import warehouseRouter from './modules/warehouses/warehouse.routes';
import workspaceRouter from './modules/workspaces/workspace.routes';
import billingRouter from './modules/billing/billing.routes';

const app = express();

// Trace Identification Middleware
app.use(requestIdMiddleware);

// Security Middlewares
app.use(helmet());
app.use(compression());

app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  }),
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logger middleware (logs request ID for unified audit tracing)
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(
    { requestId: req.id, method: req.method, url: req.url, ip: req.ip },
    'Incoming Request',
  );
  next();
});

// Setup Swagger UI Documentation
setupSwagger(app);

// Mounting System Liveness/Readiness Routes at root for container probes
app.use('/', systemRouter);

// Mounting API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/workspaces', workspaceRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/inventory', inventoryRouter);
app.use('/api/v1/purchase-orders', poRouter);
app.use('/api/v1/customers', customerRouter);
app.use('/api/v1/sales-orders', salesOrderRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/reports', reportsRouter);
app.use('/api/v1/suppliers', supplierRouter);
app.use('/api/v1/warehouses', warehouseRouter);
app.use('/api/v1/billing', billingRouter);
app.use('/api/v1', systemRouter);

// Global Error Handler
app.use(errorMiddleware);

export default app;
