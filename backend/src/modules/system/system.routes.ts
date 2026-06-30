import { Router, Request, Response } from 'express';
import prisma from '../../infra/database/prisma';
import { cacheService } from '../../infra/cache/memory-cache.service';
import logger from '../../infra/logger';
import { config } from '../../infra/config';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Retrieve system liveness status
 *     description: Simple check queried by deployment probes to check if the Node service is running.
 *     responses:
 *       200:
 *         description: Service is healthy.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 database:
 *                   type: string
 *                   example: connected
 *                 uptime:
 *                   type: number
 *                   example: 120
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 */
router.get('/health', async (_req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Database timeout')), 1500)),
    ]);
    dbStatus = 'connected';
  } catch (error) {
    logger.warn({ error }, 'Health check: Database unreachable');
  }

  res.status(200).json({
    status: 'ok',
    database: dbStatus,
    uptime: Math.round(process.uptime()),
    version: '1.0.0',
    env: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @openapi
 * /ready:
 *   get:
 *     summary: Retrieve system readiness checks
 *     description: Active verification checking connections to PostgreSQL and Redis caches.
 *     responses:
 *       200:
 *         description: Database and Cache systems are up.
 *       503:
 *         description: One or more critical dependencies are down.
 */
router.get('/ready', async (_req: Request, res: Response) => {
  const checks: Record<string, 'up' | 'down'> = {
    database: 'down',
    cache: 'down',
  };

  let hasError = false;

  // 1. Database readiness check
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database readiness timeout')), 2000),
      ),
    ]);
    checks.database = 'up';
  } catch (error) {
    logger.error({ error }, 'Readiness check: Database check failed');
    checks.database = 'down';
    hasError = true;
  }

  // 2. Cache readiness check
  try {
    const cachePing = await cacheService.ping();
    checks.cache = cachePing ? 'up' : 'down';
    if (!cachePing) hasError = true;
  } catch (error) {
    logger.error({ error }, 'Readiness check: Cache check failed');
    checks.cache = 'down';
    hasError = true;
  }

  if (hasError) {
    res.status(503).json({
      status: 'unready',
      checks,
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(200).json({
      status: 'ready',
      checks,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
