import { Router } from 'express';
import { FinanceController } from './finance.controller';
import { authenticate } from '../../common/middleware/auth.middleware';

const router = Router();
const controller = new FinanceController();

router.use(authenticate);

// Invoices
router.post('/invoices', controller.createInvoice);
router.get('/invoices', controller.getInvoices);
router.get('/invoices/:id', controller.getInvoiceById);
router.post('/invoices/payments', controller.recordPaymentReceived);

// Bills
router.post('/bills', controller.createBill);
router.get('/bills', controller.getBills);
router.get('/bills/:id', controller.getBillById);
router.post('/bills/payments', controller.recordPaymentMade);

export default router;
