import { Router, Request, Response } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const keepAlive = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 15000);

  req.on('close', () => {
    clearInterval(keepAlive);
    res.end();
  });
});

export default router;
