import swaggerJSDoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import logger from '../logger';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'StockFlow: Inventory Management Platform API',
      version: '1.0.0',
      description: 'Production-grade API for StockFlow Inventory Management platform.',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT validation cookie',
        },
      },
    },
  },
  apis: [
    './src/modules/**/*.ts',
    './src/modules/**/*.js',
    './dist/modules/**/*.js',
    './src/app.ts',
    './src/app.js',
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  logger.info('Swagger API documentation mounted on /api-docs');
};
