import { Request, Response } from 'express';
import { ImportExportService } from './import-export.service';
import { ResponseFormatter } from '../../common/responses';
import { AppError } from '../../common/errors/app-error';
import prisma from '../../infra/database/prisma';

export class ImportExportController {
  private service = new ImportExportService();

  /**
   * Endpoint for previewing the import (no database saving)
   */
  public preview = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }

      const moduleName = req.params.module;

      // Select validator based on module
      let validator = async (row: any) => [] as string[];
      if (moduleName === 'products') {
        validator = async (row: any) => {
          const errors: string[] = [];
          if (!row.name) errors.push('Name is required');
          if (!row.sku) errors.push('SKU is required');
          return errors;
        };
      }

      const result = await this.service.previewImport(req.file.buffer, validator);
      ResponseFormatter.success(res, 200, 'Preview generated successfully', result);
    } catch (error) {
      if (error instanceof AppError) {
        ResponseFormatter.error(res, error.statusCode, error.message);
      } else {
        ResponseFormatter.error(res, 500, 'Failed to parse import file');
      }
    }
  };

  /**
   * Endpoint for committing the import (saves to DB)
   */
  public commit = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }

      const moduleName = req.params.module;

      // Select validator based on module
      let validator = async (row: any) => [] as string[];
      if (moduleName === 'products') {
        validator = async (row: any) => {
          const errors: string[] = [];
          if (!row.name) errors.push('Name is required');
          if (!row.sku) errors.push('SKU is required');
          return errors;
        };
      }

      // First preview to get valid rows
      const { validRows, invalidRows } = await this.service.previewImport(req.file.buffer, validator);

      // Save valid rows based on module
      if (moduleName === 'products' && validRows.length > 0) {
        const organizationId = (req as any).user?.organizationId || (req as any).user?.workspaceId;
        if (!organizationId) throw new AppError('Unauthorized', 401);

        const insertData = validRows.map(r => ({
          organizationId,
          sku: r.sku,
          name: r.name,
          description: r.description || null,
          status: 'ACTIVE',
          productType: 'STOCK',
          sellingPrice: parseFloat(r.sellingPrice) || 0,
          costPrice: parseFloat(r.costPrice) || 0,
        }));
        
        await prisma.product.createMany({ 
          data: insertData as any, 
          skipDuplicates: true 
        });
      }

      ResponseFormatter.success(res, 200, 'Import completed successfully', {
        imported: validRows.length,
        failed: invalidRows.length
      });
    } catch (error) {
      if (error instanceof AppError) {
        ResponseFormatter.error(res, error.statusCode, error.message);
      } else {
        ResponseFormatter.error(res, 500, 'Failed to commit import');
      }
    }
  };
}
