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
import cycleCountRouter from './modules/inventory/cycle-count.routes';
import poRouter from './modules/purchase-orders/purchase-order.routes';
import customerRouter from './modules/customers/customer.routes';
import salesOrderRouter from './modules/sales-orders/sales-order.routes';
import dashboardRouter from './modules/dashboard/dashboard.routes';
import reportsRouter from './modules/reports/reports.routes';
import systemRouter from './modules/system/system.routes';
import supplierRouter from './modules/suppliers/supplier.routes';
import categoryRoutes from './modules/categories/category.routes';
import warehouseRouter from './modules/warehouses/warehouse.routes';
import workspaceRouter from './modules/workspaces/workspace.routes';
import billingRouter from './modules/billing/billing.routes';
import financeRouter from './modules/finance/finance.routes';
import integrationRouter from './modules/integrations/integration.routes';
import automationRouter from './modules/automation/automation.routes';
import purchaseReturnRouter from './modules/purchase-returns/purchase-return.routes';
import salesReturnRouter from './modules/sales-returns/sales-return.routes';
import quotationRouter from './modules/quotations/quotation.routes';
import notificationRouter from './modules/notifications/notification.routes';
import taxRuleRouter from './modules/tax-rules/tax-rule.routes';
import searchRouter from './modules/search/search.routes';
import demoRouter from './modules/system/demo.routes';
import importExportRouter from './modules/import-export/import-export.routes';
import eventsRouter from './modules/system/events.routes';


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
  max: 1000, // Limit each IP to 1000 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
// app.use('/api', limiter);

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
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/inventory', inventoryRouter);
app.use('/api/v1/cycle-counts', cycleCountRouter);
app.use('/api/v1/purchase-orders', poRouter);
app.use('/api/v1/customers', customerRouter);
app.use('/api/v1/sales-orders', salesOrderRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/reports', reportsRouter);
app.use('/api/v1/suppliers', supplierRouter);
app.use('/api/v1/warehouses', warehouseRouter);
app.use('/api/v1/billing', billingRouter);
app.use('/api/v1/finance', financeRouter);
app.use('/api/v1/integrations', integrationRouter);
app.use('/api/v1/automation', automationRouter);
app.use('/api/v1/purchase-returns', purchaseReturnRouter);
app.use('/api/v1/sales-returns', salesReturnRouter);
app.use('/api/v1/quotations', quotationRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/tax-rules', taxRuleRouter);
app.use('/api/v1/search', searchRouter);
app.use('/api/v1/demo', demoRouter);
app.use('/api/v1/import', importExportRouter);
app.use('/api/v1/events', eventsRouter);
app.use('/api/v1', systemRouter);

// Global Error Handler
app.use(errorMiddleware);

export default app;
