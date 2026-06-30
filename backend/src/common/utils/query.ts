import { Request } from 'express';

export interface ParsedQuery {
  page: number;
  limit: number;
  skip: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
}

export const parseQueryParams = (req: Request, defaultSortField = 'createdAt'): ParsedQuery => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const rawLimit = parseInt(req.query.limit as string, 10) || 10;
  const limit = Math.min(100, Math.max(1, rawLimit)); // cap limit between 1 and 100
  const skip = (page - 1) * limit;

  const sort = (req.query.sort as string) || defaultSortField;
  const rawOrder = (req.query.order as string)?.toLowerCase();
  const order: 'asc' | 'desc' = rawOrder === 'asc' ? 'asc' : 'desc';

  const search = req.query.search ? (req.query.search as string).trim() : undefined;

  return {
    page,
    limit,
    skip,
    sort,
    order,
    search,
  };
};
