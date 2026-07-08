import { Router } from 'express';
import multer from 'multer';
import { ImportExportController } from './import-export.controller';
import { authenticate } from '../../common/middleware/auth.middleware';

const router = Router();
const controller = new ImportExportController();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @openapi
 * /api/v1/import/{module}/preview:
 *   post:
 *     summary: Preview an import file (CSV)
 *     tags: [Import/Export]
 *     security:
 *       - cookieAuth: []
 */
router.post('/:module/preview', authenticate, upload.single('file'), controller.preview);

/**
 * @openapi
 * /api/v1/import/{module}/commit:
 *   post:
 *     summary: Commit an import file (CSV) to database
 *     tags: [Import/Export]
 *     security:
 *       - cookieAuth: []
 */
router.post('/:module/commit', authenticate, upload.single('file'), controller.commit);

export default router;
