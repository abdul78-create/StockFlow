import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import prisma from '../../infra/database/prisma';
import { AppError } from '../../common/errors/app-error';

type ImportPreviewResult = {
  totalRows: number;
  validRows: any[];
  invalidRows: { row: number; data: any; errors: string[] }[];
  headers: string[];
};

export class ImportExportService {
  /**
   * Parse CSV Buffer into Array of Objects
   */
  public async parseCSV(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      parse(buffer, { columns: true, skip_empty_lines: true, trim: true }, (err, records) => {
        if (err) return reject(new AppError('Invalid CSV format', 400));
        resolve(records);
      });
    });
  }

  /**
   * Generic Preview Logic
   */
  public async previewImport(
    buffer: Buffer,
    validator: (row: any) => Promise<string[]> | string[]
  ): Promise<ImportPreviewResult> {
    const records = await this.parseCSV(buffer);
    
    if (records.length === 0) {
      throw new AppError('CSV file is empty', 400);
    }

    const headers = Object.keys(records[0]);
    const validRows: any[] = [];
    const invalidRows: { row: number; data: any; errors: string[] }[] = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const errors = await validator(row);

      if (errors.length > 0) {
        invalidRows.push({ row: i + 2, data: row, errors }); // i+2 because 1 is header, 0-indexed
      } else {
        validRows.push(row);
      }
    }

    return {
      totalRows: records.length,
      validRows,
      invalidRows,
      headers
    };
  }

  /**
   * Generic Export Logic
   */
  public async exportToCSV(data: any[]): Promise<string> {
    return new Promise((resolve, reject) => {
      if (data.length === 0) {
        return resolve('');
      }
      stringify(data, { header: true }, (err, output) => {
        if (err) return reject(new AppError('Failed to generate CSV', 500));
        resolve(output);
      });
    });
  }
}
