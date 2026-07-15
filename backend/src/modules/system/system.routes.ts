import { Router, Request, Response } from 'express';
import prisma from '../../infra/database/prisma';
import { cacheService } from '../../infra/cache/memory-cache.service';
import logger from '../../infra/logger';
import { config } from '../../infra/config';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '../../common/types';

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
function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

/**
 * @openapi
 * /:
 *   get:
 *     summary: Retrieve professional API root info
 *     description: Returns server version, database/redis connection status, and links.
 *     responses:
 *       200:
 *         description: Server is healthy and running.
 */
router.get('/', async (_req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Database timeout')), 1500)),
    ]);
    dbStatus = 'connected';
  } catch (error) {
    logger.warn({ error }, 'Root check: Database unreachable');
  }

  let redisStatus = 'disconnected';
  try {
    const cachePing = await cacheService.ping();
    redisStatus = cachePing ? 'connected' : 'disconnected';
  } catch (error) {
    logger.warn({ error }, 'Root check: Redis unreachable');
  }

  const isHealthy = dbStatus === 'connected' && redisStatus === 'connected';

  res.status(isHealthy ? 200 : 500).json({
    application: 'StockFlow ERP API',
    version: '1.0.0',
    status: isHealthy ? 'healthy' : 'unhealthy',
    database: dbStatus,
    redis: redisStatus,
    environment: config.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    documentation: '/api-docs',
    health: '/health',
  });
});

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Retrieve system liveness status
 *     description: Active verification check of Express, PostgreSQL, and Redis connections.
 *     responses:
 *       200:
 *         description: Service is healthy.
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

  let redisStatus = 'disconnected';
  try {
    const cachePing = await cacheService.ping();
    redisStatus = cachePing ? 'connected' : 'disconnected';
  } catch (error) {
    logger.warn({ error }, 'Health check: Redis unreachable');
  }

  const isHealthy = dbStatus === 'connected' && redisStatus === 'connected';

  res.status(isHealthy ? 200 : 500).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    database: dbStatus,
    redis: redisStatus,
    uptime: formatUptime(process.uptime()),
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

// SSE clients store: organizationId → Set<Response>
const sseClients: Map<string, Set<Response>> = new Map();

/**
 * Broadcast a notification event to all SSE clients of an organization.
 * Called by other services when a notable event occurs.
 */
export function broadcastNotification(organizationId: string, payload: unknown) {
  const clients = sseClients.get(organizationId);
  if (!clients) return;
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  clients.forEach(res => res.write(data));
}

/**
 * SSE endpoint — clients connect here to receive real-time events.
 * Auth is via ?token= query param (JWT) since EventSource doesn't support headers.
 */
router.get('/api/v1/events', async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.token || (req.query.token as string);
    if (!token) { res.status(401).end(); return; }

    let userId: string;
    let orgId: string;

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as TokenPayload;
      userId = decoded.id;

      // Get default workspace
      const member = await prisma.organizationMember.findFirst({ where: { userId, status: 'ACTIVE' }, select: { organizationId: true } });
      if (!member) { res.status(403).end(); return; }
      orgId = member.organizationId;
    } catch {
      res.status(401).end();
      return;
    }

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Register client
    if (!sseClients.has(orgId)) sseClients.set(orgId, new Set());
    sseClients.get(orgId)!.add(res);
    logger.info({ userId, orgId }, 'SSE client connected');

    // Send keepalive every 30s
    const keepalive = setInterval(() => res.write(': keepalive\n\n'), 30000);

    req.on('close', () => {
      clearInterval(keepalive);
      sseClients.get(orgId)?.delete(res);
      logger.info({ userId, orgId }, 'SSE client disconnected');
    });
  } catch (err) {
    logger.error({ err }, 'SSE error');
    res.status(500).end();
  }
});

export default router;
