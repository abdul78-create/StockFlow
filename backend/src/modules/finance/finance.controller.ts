import { Request, Response, NextFunction } from 'express';
import { FinanceService } from './finance.service';
import { 
  createInvoiceSchema, 
  createBillSchema, 
  createPaymentReceivedSchema, 
  createPaymentMadeSchema 
} from './finance.validation';


export class FinanceController {
  private service: FinanceService;

  constructor() {
    this.service = new FinanceService();
  }

  // Invoices
  createInvoice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.headers['x-organization-id'] as string;
      const validatedData = createInvoiceSchema.parse(req.body);
      
      const invoice = await this.service.createInvoice(organizationId, validatedData);
      
      res.status(201).json({
        success: true,
        data: invoice
      });
    } catch (error) {
      next(error);
    }
  };

  getInvoices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.headers['x-organization-id'] as string;
      const invoices = await this.service.getInvoices(organizationId);
      
      res.json({
        success: true,
        data: invoices
      });
    } catch (error) {
      next(error);
    }
  };

  getInvoiceById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.headers['x-organization-id'] as string;
      const invoice = await this.service.getInvoiceById(req.params.id, organizationId);
      
      res.json({
        success: true,
        data: invoice
      });
    } catch (error) {
      next(error);
    }
  };

  // Bills
  createBill = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.headers['x-organization-id'] as string;
      const validatedData = createBillSchema.parse(req.body);
      
      const bill = await this.service.createBill(organizationId, validatedData);
      
      res.status(201).json({
        success: true,
        data: bill
      });
    } catch (error) {
      next(error);
    }
  };

  getBills = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.headers['x-organization-id'] as string;
      const bills = await this.service.getBills(organizationId);
      
      res.json({
        success: true,
        data: bills
      });
    } catch (error) {
      next(error);
    }
  };

  getBillById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.headers['x-organization-id'] as string;
      const bill = await this.service.getBillById(req.params.id, organizationId);
      
      res.json({
        success: true,
        data: bill
      });
    } catch (error) {
      next(error);
    }
  };

  // Payments
  recordPaymentReceived = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.headers['x-organization-id'] as string;
      const validatedData = createPaymentReceivedSchema.parse(req.body);
      
      const payment = await this.service.recordPaymentReceived(organizationId, validatedData);
      
      res.status(201).json({
        success: true,
        data: payment
      });
    } catch (error) {
      next(error);
    }
  };

  recordPaymentMade = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.headers['x-organization-id'] as string;
      const validatedData = createPaymentMadeSchema.parse(req.body);
      
      const payment = await this.service.recordPaymentMade(organizationId, validatedData);
      
      res.status(201).json({
        success: true,
        data: payment
      });
    } catch (error) {
      next(error);
    }
  };
}
